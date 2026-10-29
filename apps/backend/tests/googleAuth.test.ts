import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { googleSignInClient } from "../src/utils/googleSignIn.js";
import authRoutes from "../src/routes/authRoute.js";

test("Google sign-in preserves accounts and validates provider credentials", async (t) => {
  // Network and database boundaries are isolated. Token verification uses the real Google library.
  const stub = (target: any, key: string, value: any) => {
    const original = target[key];
    target[key] = value;
    t.after(() => { target[key] = original; });
  };
  const env = { ...process.env };
  Object.assign(process.env, {
    GOOGLE_SIGN_IN_CLIENT_ID: "test-client.apps.googleusercontent.com",
    JWT_SECRET: "google-sign-in-test-secret", JWT_EXPIRES_IN: "7d", JWT_COOKIE_EXPIRES_IN: "7",
  });
  t.after(() => {
    for (const key of ["GOOGLE_SIGN_IN_CLIENT_ID", "JWT_SECRET", "JWT_EXPIRES_IN", "JWT_COOKIE_EXPIRES_IN"]) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
  });

  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const otherKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  stub(googleSignInClient, "getFederatedSignonCertsAsync", async () => ({
    certs: { test: publicKey.export({ type: "spki", format: "pem" }) },
  }));
  const credential = (claims: Record<string, unknown> = {}, badSignature = false) => {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({
      iss: "https://accounts.google.com", aud: process.env.GOOGLE_SIGN_IN_CLIENT_ID,
      sub: "google-existing", email: "existing@example.com", email_verified: true,
      name: "Changed Google Name", iat: now, exp: now + 3600, ...claims,
    }, badSignature ? otherKeys.privateKey : privateKey, { algorithm: "RS256", keyid: "test" });
  };

  const hash = await bcrypt.hash("existing-password", 4);
  const existing = {
    id: "11111111-1111-4111-8111-111111111111", email: "Existing@Example.com",
    name: "Original CRM Name", password: hash, googleId: null as string | null,
    // Role and organization come from the membership in the organization the user has open.
    orgId: "org-existing",
    memberships: [{
      orgId: "org-existing", role: "ADMIN", createdAt: new Date(0),
      organization: { id: "org-existing", name: "Original Organization" },
    }],
    get role() { return this.memberships[0].role; },
    get organization() { return this.memberships[0].organization; },
  };
  let users: any[] = [];
  let writes: any[] = [];
  let race = false;
  let createConflict = false;
  const reset = () => { users = [Object.defineProperties({}, Object.getOwnPropertyDescriptors(existing))]; writes = []; race = false; createConflict = false; };
  const withoutGoogleId = (user: any) => { const { googleId, ...rest } = user; return rest; };
  reset();
  stub(prisma.user, "findUnique", async ({ where }: any) => users.find((u) =>
    (where.id && u.id === where.id) || (where.googleId && u.googleId === where.googleId) || (where.email && u.email.toLowerCase() === where.email.toLowerCase()),
  ) || null);
  stub(prisma.user, "findMany", async ({ where }: any) => users.filter((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()));
  stub(prisma.user, "updateMany", async ({ where, data }: any) => {
    if (race) return { count: 0 };
    const user = users.find((u) => u.id === where.id && u.googleId === where.googleId && u.password === where.password);
    if (!user) return { count: 0 };
    writes.push({ where, data }); Object.assign(user, data); return { count: 1 };
  });
  stub(prisma.user, "create", async ({ data }: any) => {
    if (createConflict) throw new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002", clientVersion: "test" });
    const user = { id: "new-user", orgId: null, memberships: [], ...data };
    users.push(user); writes.push(data); return user;
  });
  stub(prisma.user, "update", async ({ where, data }: any) => {
    const user = users.find((u) => u.id === where.id); Object.assign(user, data); writes.push(data); return user;
  });
  t.after(() => prisma.$disconnect());

  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve()); server.closeAllConnections();
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/auth`;
  const post = (path: string, data: unknown) => fetch(`${base}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });

  await t.test("existing accounts require their password before linking; no duplicate or mutation", async () => {
    const response = await post("/google", { credential: credential() });
    assert.equal(response.status, 409);
    const body = await response.json();
    assert.equal(body.code, "GOOGLE_LINK_REQUIRED");
    assert.equal(body.email, existing.email);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(users.length, 1); assert.deepEqual(writes, []);
  });

  await t.test("wrong passwords cannot link or issue a session", async () => {
    const response = await post("/google", { credential: credential(), currentPassword: "wrong-password" });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, "GOOGLE_LINK_PASSWORD_INVALID");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.deepEqual(writes, []);
  });

  await t.test("linking preserves user ID, password, name, organization and role", async () => {
    const response = await post("/google", { credential: credential(), currentPassword: "existing-password" });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(withoutGoogleId(users[0]), withoutGoogleId(existing));
    assert.equal(users.length, 1);
    assert.deepEqual(writes[0].data, { googleId: "google-existing" });
    assert.equal(body.data.user.id, existing.id);
    assert.equal(body.data.user.role, "ADMIN");
    assert.deepEqual(body.data.user.organization, existing.organization);
    assert.equal(body.data.user.hasPassword, true);
    assert.equal(body.data.user.password, undefined); assert.equal(body.data.user.googleId, undefined);
    const cookie = response.headers.get("set-cookie")!;
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/);
    const token = decodeURIComponent(cookie.match(/jwt=([^;]+)/)![1]!);
    const session = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    assert.equal(session.userId, existing.id); assert.equal(session.orgId, existing.orgId);
  });

  await t.test("linked users need no password and Google email changes do not create an account", async () => {
    const response = await post("/google", { credential: credential({ email: "changed@example.com" }) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).data.user.id, existing.id);
    assert.equal(users[0].email, existing.email); assert.equal(users.length, 1);
  });

  await t.test("original password login still works after linking", async () => {
    const response = await post("/login", { email: "existing@example.com", password: "existing-password" });
    assert.equal(response.status, 200);
    const user = (await response.json()).data.user;
    assert.equal(user.id, existing.id); assert.equal(user.hasPassword, true);
    assert.equal(user.name, existing.name); assert.deepEqual(user.organization, existing.organization);
  });

  await t.test("a different Google subject cannot replace an existing link", async () => {
    const response = await post("/google", { credential: credential({ sub: "different-google" }), currentPassword: "existing-password" });
    assert.equal(response.status, 409); assert.equal(users[0].googleId, "google-existing");
  });

  await t.test("new Google accounts are members without an invented password or organization", async () => {
    const response = await post("/google", { credential: credential({ sub: "new-google", email: "NEW@example.com", name: "New Member" }) });
    assert.equal(response.status, 200);
    const user = (await response.json()).data.user;
    assert.equal(user.hasPassword, false); assert.equal(user.role, "MEMBER");
    assert.equal(user.organization, null); assert.equal(user.email, "new@example.com");
    assert.equal(users[1].password, null); assert.equal(users[1].googleId, "new-google");
    const passwordResponse = await post("/login", { email: "new@example.com", password: "any-password" });
    assert.equal(passwordResponse.status, 400);
    assert.match((await passwordResponse.json()).message, /Invalid email or password/);
  });

  await t.test("Google-only profile changes keep authentication metadata and organization", async () => {
    const token = jwt.sign({ userId: "new-user" }, process.env.JWT_SECRET!);
    const response = await fetch(`${base}/update-me`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Updated Member" }),
    });
    const user = (await response.json()).data.user;
    assert.equal(response.status, 200); assert.equal(user.hasPassword, false);
    assert.equal(user.name, "Updated Member"); assert.equal(user.organization, null);
    const change = await fetch(`${base}/change-password`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "unknown", newPassword: "new-password" }),
    });
    assert.equal(change.status, 400);
    assert.match((await change.json()).message, /uses Google sign-in/);
  });

  await t.test("real token verifier rejects forged, expired, wrong-audience and wrong-issuer credentials", async () => {
    reset();
    const now = Math.floor(Date.now() / 1000);
    const invalid = [
      "not-a-jwt", credential({}, true), credential({ aud: "another-app" }),
      credential({ iss: "https://attacker.example.com" }), credential({ iat: now - 7200, exp: now - 3600 }),
      credential({ email_verified: false }), credential({ email: undefined }), credential({ sub: undefined }),
    ];
    for (const token of invalid) {
      const response = await post("/google", { credential: token, currentPassword: "existing-password" });
      assert.equal(response.status, 401); assert.equal(response.headers.get("set-cookie"), null);
    }
    assert.deepEqual(writes, []);
  });

  await t.test("disabled and malformed requests fail without changing any accounts", async () => {
    delete process.env.GOOGLE_SIGN_IN_CLIENT_ID;
    assert.equal((await post("/google", { credential: credential() })).status, 503);
    process.env.GOOGLE_SIGN_IN_CLIENT_ID = "test-client.apps.googleusercontent.com";
    for (const body of [{}, { credential: "" }, { credential: 10 }, { credential: "x".repeat(8193) }, { credential: credential(), currentPassword: 1 }]) {
      assert.equal((await post("/google", body)).status, 400);
    }
    assert.equal((await fetch(`${base}/google`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "credential=x" })).status, 415);
    assert.deepEqual(writes, []);
  });

  await t.test("concurrent link and duplicate creation conflicts fail safely", async () => {
    reset(); race = true;
    const response = await post("/google", { credential: credential(), currentPassword: "existing-password" });
    assert.equal(response.status, 409); assert.equal(users[0].googleId, null);
    assert.deepEqual(writes, []);
    createConflict = true;
    assert.equal((await post("/google", { credential: credential({ sub: "new", email: "new@example.com" }) })).status, 409);
    assert.equal(users.length, 1);
  });

  await t.test("ambiguous case-insensitive legacy emails are never merged", async () => {
    reset(); users.push({ ...existing, id: "second-user", email: "existing@example.com" });
    const response = await post("/google", { credential: credential(), currentPassword: "existing-password" });
    assert.equal(response.status, 409); assert.deepEqual(writes, []);
  });
});
