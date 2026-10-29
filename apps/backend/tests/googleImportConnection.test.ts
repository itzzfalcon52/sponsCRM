import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import cookieParser from "cookie-parser";
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma.js";
import { sanitizeUser } from "../src/controllers/authController.js";
import {
  connectGoogleForImport,
  disconnectGoogleForImport,
  googleCallback,
} from "../src/controllers/exportCompaniesController.js";
import { readGoogleSheet } from "../src/models/googleSheetImport.js";
import { decryptSecret, encryptSecret } from "../src/utils/secretBox.js";
import { getSheetsClientFor } from "../src/utils/googleSheetsClient.js";
import companyRoutes from "../src/routes/companyRoutes.js";
import exportRoutes from "../src/routes/exportRoute.js";

const userId = "11111111-1111-4111-8111-111111111111";
const orgId = "33333333-3333-4333-8333-333333333333";

const withSecret = (t: any) => {
  const before = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "google-import-test-secret";
  t.after(() => {
    if (before === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = before;
  });
};

const stub = (t: any, target: any, key: string, fn: any) => {
  const original = target[key];
  target[key] = fn;
  t.after(() => { target[key] = original; });
};

const respond = () => {
  const out: any = { statusCode: 200, body: undefined, redirected: undefined };
  out.status = (code: number) => { out.statusCode = code; return out; };
  out.send = (body: any) => { out.body = body; return out; };
  out.json = (body: any) => { out.body = body; return out; };
  out.redirect = (url: string) => { out.redirected = url; return out; };
  return out;
};

test("secretBox", (t) => {
  withSecret(t);
  const box = encryptSecret("1//refresh-token-value");
  assert.ok(box.startsWith("v1:"));
  assert.ok(!box.includes("refresh-token-value"));
  assert.equal(decryptSecret(box), "1//refresh-token-value");
  // random IV: the same secret never encrypts the same way twice
  assert.notEqual(encryptSecret("1//refresh-token-value"), box);

  // changed ciphertext, changed tag, junk and a different secret are all refused
  const [version, payload] = box.split(":");
  const [iv, tag, data] = payload.split(".");
  const flip = (value: string) => (value[0] === "A" ? "B" : "A") + value.slice(1);
  assert.throws(() => decryptSecret(`${version}:${iv}.${tag}.${flip(data)}`));
  assert.throws(() => decryptSecret(`${version}:${iv}.${flip(tag)}.${data}`));
  assert.throws(() => decryptSecret("not a secret"));
  assert.throws(() => decryptSecret("v2:a.b.c"));
  process.env.JWT_SECRET = "a-different-secret";
  assert.throws(() => decryptSecret(box));
});

test("the session payload says whether Google is connected but never includes the token", () => {
  const user = sanitizeUser({ id: userId, email: "u@example.com", googleSheetsToken: "v1:secret" });
  assert.equal(user.googleImportConnected, true);
  assert.ok(!JSON.stringify(user).includes("v1:secret"));
  assert.equal(sanitizeUser({ id: userId, email: "u@example.com", googleSheetsToken: null }).googleImportConnected, false);
});

test("connecting your own Google account", async (t) => {
  withSecret(t);
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/v1/google/callback";

  await t.test("the link asks for read-only access with a signed state that is not a login", () => {
    const res = respond();
    connectGoogleForImport({ user: { id: userId, orgId } }, res);
    const url = new URL(res.body.url);
    assert.equal(url.searchParams.get("scope"), "https://www.googleapis.com/auth/spreadsheets.readonly");
    assert.equal(url.searchParams.get("access_type"), "offline");
    const claims = jwt.verify(url.searchParams.get("state")!, process.env.JWT_SECRET!) as any;
    assert.equal(claims.purpose, "google-import-connect");
    assert.equal(claims.uid, userId);
    assert.equal(claims.userId, undefined);
    assert.ok(claims.exp - claims.iat <= 600);
  });

  await t.test("the callback stores an encrypted refresh token for the right person", async () => {
    stub(t, google.auth.OAuth2.prototype, "getToken", async () => ({ tokens: { refresh_token: "1//the-refresh-token", access_token: "ya29.access" } }));
    let saved: any;
    stub(t, prisma.user, "updateMany", async (args: any) => { saved = args; return { count: 1 }; });
    process.env.FRONTEND_URL = "http://localhost:5173/";
    t.after(() => { delete process.env.FRONTEND_URL; });

    const state = jwt.sign({ purpose: "google-import-connect", uid: userId }, process.env.JWT_SECRET!);
    const res = respond();
    await googleCallback({ query: { code: "auth-code", state } }, res);

    assert.equal(res.redirected, "http://localhost:5173/companies?googleImport=connected");
    assert.deepEqual(saved.where, { id: userId });
    assert.notEqual(saved.data.googleSheetsToken, "1//the-refresh-token");
    assert.ok(!JSON.stringify(saved).includes("ya29.access"));
    assert.equal(decryptSecret(saved.data.googleSheetsToken), "1//the-refresh-token");
    assert.ok(saved.data.googleSheetsConnectedAt instanceof Date);
  });

  await t.test("cancelling at Google, or no refresh token, saves nothing", async () => {
    let writes = 0;
    stub(t, prisma.user, "updateMany", async () => { writes++; return { count: 1 }; });
    const state = jwt.sign({ purpose: "google-import-connect", uid: userId }, process.env.JWT_SECRET!);

    const cancelled = respond();
    await googleCallback({ query: { state, error: "access_denied" } }, cancelled);
    assert.ok(cancelled.redirected.endsWith("/companies?googleImport=failed"));

    stub(t, google.auth.OAuth2.prototype, "getToken", async () => ({ tokens: { access_token: "only-access" } }));
    const noRefresh = respond();
    await googleCallback({ query: { code: "c", state } }, noRefresh);
    assert.ok(noRefresh.redirected.endsWith("/companies?googleImport=failed"));
    assert.equal(writes, 0);
  });

  await t.test("forged, expired and wrong-purpose state is refused", async () => {
    let writes = 0;
    stub(t, prisma.user, "updateMany", async () => { writes++; return { count: 1 }; });
    for (const state of [
      jwt.sign({ purpose: "google-import-connect", uid: userId }, "wrong-secret"),
      jwt.sign({ purpose: "google-import-connect", uid: userId }, process.env.JWT_SECRET!, { expiresIn: -10 }),
      jwt.sign({ purpose: "something-else", uid: userId }, process.env.JWT_SECRET!),
      userId,
    ]) {
      const res = respond();
      await googleCallback({ query: { code: "c", state } }, res);
      assert.equal(res.statusCode, 400);
    }
    assert.equal(writes, 0);
  });

  await t.test("disconnecting clears the token and returns the session without it", async () => {
    let cleared: any;
    stub(t, prisma.user, "update", async (args: any) => { cleared = args; return {}; });
    stub(t, prisma.user, "findUnique", async () => ({
      id: userId, email: "u@example.com", orgId: null, memberships: [], googleSheetsToken: null,
    }));
    const res = respond();
    await disconnectGoogleForImport({ user: { id: userId } }, res);
    assert.deepEqual(cleared.data, { googleSheetsToken: null, googleSheetsConnectedAt: null });
    assert.equal(res.body.data.user.googleImportConnected, false);
  });
});

test("which Google connection is used to read a sheet", async (t) => {
  withSecret(t);
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/v1/google/callback";
  t.after(async () => { await prisma.$disconnect(); });

  let userRow: any = {};
  let orgRow: any = {};
  let cleared = 0;
  stub(t, prisma.user, "findUnique", async () => userRow);
  stub(t, prisma.organization, "findUnique", async () => orgRow);
  stub(t, prisma.user, "update", async () => { cleared++; return {}; });

  await t.test("the person's own connection wins over the organization's", async () => {
    userRow = { googleSheetsToken: encryptSecret("user-refresh") };
    orgRow = { googleAccessToken: "org-access", googleRefreshToken: "org-refresh" };
    const { source } = await getSheetsClientFor(userId, orgId);
    assert.equal(source, "user");
  });

  await t.test("without one, the organization's connection still works", async () => {
    userRow = { googleSheetsToken: null };
    const { source } = await getSheetsClientFor(userId, orgId);
    assert.equal(source, "org");
  });

  await t.test("with neither, the person is told to connect", async () => {
    orgRow = { googleAccessToken: null, googleRefreshToken: null };
    await assert.rejects(getSheetsClientFor(userId, orgId), (e: any) =>
      e.code === "GOOGLE_NOT_CONNECTED" && e.status === 409 && /Connect your Google account/.test(e.message));
  });

  await t.test("an unreadable stored token is dropped and a reconnect is requested", async () => {
    userRow = { googleSheetsToken: "v1:AAAA.BBBB.CCCC" };
    cleared = 0;
    await assert.rejects(getSheetsClientFor(userId, orgId), (e: any) => e.code === "GOOGLE_RECONNECT_REQUIRED");
    assert.equal(cleared, 1);
  });

  await t.test("Google rejecting the person's token clears it and asks them to reconnect", async () => {
    userRow = { googleSheetsToken: encryptSecret("revoked-refresh") };
    orgRow = { googleAccessToken: "org-access", googleRefreshToken: "org-refresh" };
    cleared = 0;
    stub(t, google, "sheets", () => ({
      spreadsheets: {
        get: async () => { throw { response: { data: { error: "invalid_grant" } } }; },
      },
    }));
    await assert.rejects(
      readGoogleSheet(userId, orgId, { url: "https://docs.google.com/spreadsheets/d/abc123/edit" }),
      (e: any) => e.code === "GOOGLE_RECONNECT_REQUIRED" && /Connect your Google account again/.test(e.message),
    );
    assert.equal(cleared, 1);
  });

  await t.test("a sheet the account cannot open says to share it with the connected account", async () => {
    userRow = { googleSheetsToken: encryptSecret("good-refresh") };
    cleared = 0;
    stub(t, google, "sheets", () => ({
      spreadsheets: { get: async () => { throw { code: 403 }; } },
    }));
    await assert.rejects(
      readGoogleSheet(userId, orgId, { url: "https://docs.google.com/spreadsheets/d/abc123/edit" }),
      (e: any) => e.code === "SHEET_NO_ACCESS" && /Google account you connected/.test(e.message),
    );
    assert.equal(cleared, 0);
  });
});

test("every role can use sheet import and connect their own Google account", async (t) => {
  withSecret(t);
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/v1/google/callback";
  process.env.JWT_EXPIRES_IN = "1h";

  let role = "MEMBER";
  stub(t, prisma.user, "findUnique", async () => ({
    id: userId, orgId, memberships: [{ orgId, role }],
  }));
  stub(t, prisma.organization, "findUnique", async () => ({ id: orgId }));
  t.after(async () => { await prisma.$disconnect(); });

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/companies", companyRoutes);
  app.use("/google", exportRoutes);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  const headers = () => ({
    "content-type": "application/json",
    authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET!)}`,
  });

  for (const r of ["MEMBER", "SENIOR", "ADMIN"]) {
    await t.test(`${r} can connect their own Google account and open the sheet import`, async () => {
      role = r;
      const connect = await fetch(`${base}/google/connect-import`, { headers: headers() });
      assert.equal(connect.status, 200);
      assert.ok((await connect.json()).url.startsWith("https://accounts.google.com/"));

      // reaches the import handler (a nonsense link is a 400 from the handler, not a 403 from a role check)
      const preview = await fetch(`${base}/companies/import/google-sheet`, {
        method: "POST", headers: headers(), body: JSON.stringify({ url: "not a sheet link" }),
      });
      assert.equal(preview.status, 400);
      assert.equal((await preview.json()).error, "INVALID_SHEET_URL");
    });
  }

  await t.test("connecting needs a login", async () => {
    const response = await fetch(`${base}/google/connect-import`);
    assert.equal(response.status, 401);
  });

  await t.test("the organization-wide Connect Google and Sync stay admin-only", async () => {
    role = "MEMBER";
    assert.equal((await fetch(`${base}/google/connect`, { headers: headers() })).status, 403);
    assert.equal((await fetch(`${base}/google/sync`, { method: "POST", headers: headers() })).status, 403);
    role = "ADMIN";
    assert.equal((await fetch(`${base}/google/connect`, { headers: headers() })).status, 200);
  });
});
