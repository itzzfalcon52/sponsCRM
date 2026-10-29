import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma.js";
import { resolveActiveMembership, withActiveOrg } from "../src/models/sessionModule.js";
import {
  leaveOrganization,
  removeOrganizationMember,
  updateMemberRole,
} from "../src/models/organisationModule.js";
import { getMyNotifications } from "../src/models/notificationModule.js";
import { googleCallback, connectGoogle } from "../src/controllers/exportCompaniesController.js";
import orgRoutes from "../src/routes/orgRoute.js";

const userId = "11111111-1111-4111-8111-111111111111";
const orgA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const orgB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

test("resolveActiveMembership", () => {
  const list = [
    { orgId: orgA, role: "ADMIN" as const },
    { orgId: orgB, role: "MEMBER" as const },
  ];
  assert.equal(resolveActiveMembership(orgB, list)?.role, "MEMBER");
  assert.equal(resolveActiveMembership(orgA, list)?.role, "ADMIN");
  // no longer a member of the open org -> oldest membership
  assert.equal(resolveActiveMembership("gone", list)?.orgId, orgA);
  assert.equal(resolveActiveMembership(null, list)?.orgId, orgA);
  assert.equal(resolveActiveMembership(orgA, []), null);
  assert.equal(resolveActiveMembership(orgA, undefined), null);
});

test("withActiveOrg gives the role of the open org and lists all orgs", () => {
  const user = withActiveOrg({
    id: userId,
    orgId: orgB,
    memberships: [
      { orgId: orgA, role: "ADMIN", organization: { id: orgA, name: "A" } },
      { orgId: orgB, role: "MEMBER", organization: { id: orgB, name: "B" } },
    ],
  } as any);
  assert.equal(user.role, "MEMBER");
  assert.equal(user.orgId, orgB);
  assert.equal(user.organization?.name, "B");
  assert.deepEqual(user.organizations, [
    { id: orgA, name: "A", role: "ADMIN" },
    { id: orgB, name: "B", role: "MEMBER" },
  ]);

  const none = withActiveOrg({ id: userId, orgId: null, memberships: [] } as any);
  assert.equal(none.organization, null);
  assert.equal(none.orgId, null);
  assert.deepEqual(none.organizations, []);
});

test("organization membership rules", async (t) => {
  const memberships: any[] = [];
  const users: any[] = [];
  const stub = (target: any, key: string, fn: any) => {
    const original = target[key];
    target[key] = fn;
    t.after(() => { target[key] = original; });
  };
  const find = (where: any) =>
    memberships.find((m) => m.userId === where.userId_orgId.userId && m.orgId === where.userId_orgId.orgId) ?? null;

  stub(prisma.membership, "findUnique", async ({ where }: any) => find(where));
  stub(prisma.membership, "count", async ({ where }: any) =>
    memberships.filter((m) => m.orgId === where.orgId && m.role === where.role && m.userId !== where.NOT.userId).length);
  stub(prisma.membership, "delete", async ({ where }: any) => {
    memberships.splice(memberships.findIndex((m) => m.id === where.id), 1);
  });
  stub(prisma.membership, "update", async ({ where, data }: any) => {
    Object.assign(memberships.find((m) => m.id === where.id), data);
  });
  stub(prisma.user, "updateMany", async ({ where, data }: any) => {
    for (const u of users) if (u.id === where.id && u.orgId === where.orgId) Object.assign(u, data);
    return { count: 1 };
  });
  stub(prisma, "$transaction", async (cb: any) => cb(prisma));
  t.after(async () => { await prisma.$disconnect(); });

  const reset = () => {
    memberships.length = 0;
    memberships.push(
      { id: "m1", userId, orgId: orgA, role: "ADMIN" },
      { id: "m2", userId, orgId: orgB, role: "MEMBER" },
      { id: "m3", userId: "other", orgId: orgA, role: "MEMBER" },
    );
    users.length = 0;
    users.push({ id: userId, orgId: orgA });
  };

  await t.test("the last admin cannot leave", async () => {
    reset();
    await assert.rejects(leaveOrganization(userId, orgA), /last Admin/);
    assert.ok(find({ userId_orgId: { userId, orgId: orgA } }));
  });

  await t.test("an admin can leave once another admin exists, keeping other orgs", async () => {
    reset();
    memberships.find((m) => m.id === "m3").role = "ADMIN";
    await leaveOrganization(userId, orgA);
    assert.equal(find({ userId_orgId: { userId, orgId: orgA } }), null);
    assert.ok(find({ userId_orgId: { userId, orgId: orgB } }));
    // the org they had open is cleared so the session falls back to another
    assert.equal(users[0].orgId, null);
  });

  await t.test("leaving an org you are not in fails", async () => {
    reset();
    await assert.rejects(leaveOrganization("stranger", orgA), /not a member/);
  });

  await t.test("the last admin cannot be demoted, an admin can when another exists", async () => {
    reset();
    await assert.rejects(updateMemberRole(userId, orgA, "MEMBER"), /at least one Admin/);
    memberships.find((m) => m.id === "m3").role = "ADMIN";
    await updateMemberRole(userId, orgA, "MEMBER");
    assert.equal(memberships.find((m) => m.id === "m1").role, "MEMBER");
  });

  await t.test("role changes only apply to the given org", async () => {
    reset();
    await updateMemberRole("other", orgA, "SENIOR");
    assert.equal(memberships.find((m) => m.id === "m3").role, "SENIOR");
    assert.equal(memberships.find((m) => m.id === "m2").role, "MEMBER");
  });

  await t.test("removing a member only removes the membership in that org", async () => {
    reset();
    await removeOrganizationMember(userId, orgA);
    assert.equal(find({ userId_orgId: { userId, orgId: orgA } }), null);
    assert.ok(find({ userId_orgId: { userId, orgId: orgB } }));
    await assert.rejects(removeOrganizationMember("stranger", orgA), /not found/);
  });
});

test("notifications are limited to the open organization", async (t) => {
  let query: any;
  const original = prisma.notification.findMany;
  (prisma.notification as any).findMany = async (args: any) => { query = args; return []; };
  t.after(async () => { (prisma.notification as any).findMany = original; await prisma.$disconnect(); });

  await getMyNotifications(userId, orgB);
  assert.equal(query.where.userId, userId);
  assert.equal(query.where.orgId, orgB);

  query = undefined;
  assert.deepEqual(await getMyNotifications(userId, null), []);
  assert.equal(query, undefined);
});

test("switch endpoint and the Google connect state", async (t) => {
  const secretBefore = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "multi-org-test-secret";
  t.after(() => {
    if (secretBefore === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secretBefore;
  });

  let openOrg: string | null = orgA;
  let updated: any;
  const stub = (target: any, key: string, fn: any) => {
    const original = target[key];
    target[key] = fn;
    t.after(() => { target[key] = original; });
  };
  const memberships = [
    { orgId: orgA, role: "ADMIN", createdAt: new Date(0), organization: { id: orgA, name: "A" } },
    { orgId: orgB, role: "MEMBER", createdAt: new Date(1), organization: { id: orgB, name: "B" } },
  ];
  stub(prisma.user, "findUnique", async (args: any) => {
    // protect() selects memberships without `organization`; loadSessionUser includes it
    return { id: userId, email: "u@example.com", name: "U", password: null, orgId: openOrg, memberships };
  });
  stub(prisma.user, "update", async ({ data }: any) => { updated = data; openOrg = data.orgId; return { id: userId }; });
  stub(prisma.membership, "findUnique", async ({ where }: any) =>
    memberships.find((m) => m.orgId === where.userId_orgId.orgId) ?? null);
  t.after(async () => { await prisma.$disconnect(); });

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/org", orgRoutes);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/org`;
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.JWT_COOKIE_EXPIRES_IN = "1";
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET!)}`,
  };

  await t.test("switching to an org you belong to opens it and reports your role there", async () => {
    const response = await fetch(`${base}/switch`, { method: "POST", headers, body: JSON.stringify({ orgId: orgB }) });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(updated.orgId, orgB);
    // the legacy column follows the open org's role, so a rollback keeps roles
    assert.equal(updated.role, "MEMBER");
    assert.equal(body.data.user.role, "MEMBER");
    assert.equal(body.data.user.organization.id, orgB);
    assert.deepEqual(body.data.user.organizations.map((o: any) => o.id), [orgA, orgB]);
    // org secrets are not part of the session payload shape beyond the org row itself
    const session = jwt.verify(
      /jwt=([^;]+)/.exec(response.headers.get("set-cookie") ?? "")![1],
      process.env.JWT_SECRET!,
    ) as any;
    assert.equal(session.orgId, orgB);
    assert.equal(session.role, "MEMBER");
  });

  await t.test("switching to an org you do not belong to is refused", async () => {
    updated = undefined;
    const response = await fetch(`${base}/switch`, {
      method: "POST", headers, body: JSON.stringify({ orgId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }),
    });
    assert.equal(response.status, 403);
    assert.equal(updated, undefined);
  });

  await t.test("switch requires an orgId", async () => {
    const response = await fetch(`${base}/switch`, { method: "POST", headers, body: JSON.stringify({}) });
    assert.equal(response.status, 400);
  });

  const respond = () => {
    const out: any = { statusCode: 200, body: undefined };
    out.status = (code: number) => { out.statusCode = code; return out; };
    out.send = (body: any) => { out.body = body; return out; };
    out.json = (body: any) => { out.body = body; return out; };
    out.redirect = (url: string) => { out.redirected = url; return out; };
    return out;
  };

  await t.test("the Google connect state is signed and names the open org", async () => {
    const res = respond();
    connectGoogle({ user: { id: userId, orgId: orgB } }, res);
    const state = new URL(res.body.url).searchParams.get("state")!;
    const claims = jwt.verify(state, process.env.JWT_SECRET!) as any;
    assert.equal(claims.uid, userId);
    assert.equal(claims.oid, orgB);
    assert.equal(claims.purpose, "google-connect");
    // must not look like a session token
    assert.equal(claims.userId, undefined);
  });

  await t.test("the Google callback rejects forged, expired and wrong-purpose state", async () => {
    for (const state of [
      userId, // the old format: a bare user id
      jwt.sign({ purpose: "google-connect", uid: userId, oid: orgA }, "wrong-secret"),
      jwt.sign({ purpose: "google-connect", uid: userId, oid: orgA }, process.env.JWT_SECRET!, { expiresIn: -10 }),
      jwt.sign({ purpose: "login", uid: userId, oid: orgA }, process.env.JWT_SECRET!),
    ]) {
      const res = respond();
      await googleCallback({ query: { code: "code", state } }, res);
      assert.equal(res.statusCode, 400);
    }
  });

  await t.test("only an admin of that org can finish connecting Google", async () => {
    const state = jwt.sign({ purpose: "google-connect", uid: userId, oid: orgB }, process.env.JWT_SECRET!);
    const res = respond();
    await googleCallback({ query: { code: "code", state } }, res);
    assert.equal(res.statusCode, 403); // MEMBER in org B
  });

  await t.test("a Google connect state token is not accepted as a login", async () => {
    const res = respond();
    connectGoogle({ user: { id: userId, orgId: orgA } }, res);
    const state = new URL(res.body.url).searchParams.get("state")!;
    const response = await fetch(`${base}/switch`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${state}` },
      body: JSON.stringify({ orgId: orgB }),
    });
    assert.equal(response.status, 401);

    // even a token that has a userId claim is refused when it carries a purpose
    const sneaky = jwt.sign({ userId, purpose: "google-connect" }, process.env.JWT_SECRET!);
    const sneakyResponse = await fetch(`${base}/switch`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${sneaky}` },
      body: JSON.stringify({ orgId: orgB }),
    });
    assert.equal(sneakyResponse.status, 401);
  });
});

test("a legacy user with an open org but no membership is repaired", async (t) => {
  const secretBefore = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "multi-org-heal-secret";
  t.after(() => {
    if (secretBefore === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secretBefore;
  });

  const rows: any[] = [];
  const upserts: any[] = [];
  const stub = (target: any, key: string, fn: any) => {
    const original = target[key];
    target[key] = fn;
    t.after(() => { target[key] = original; });
  };
  // As written by the previous version of the app: orgId + role on the user, no membership.
  stub(prisma.user, "findUnique", async () =>
    ({ id: userId, orgId: orgA, role: "ADMIN", memberships: [...rows] }));
  stub(prisma.organization, "findUnique", async () => ({ id: orgA }));
  stub(prisma.membership, "upsert", async (args: any) => {
    upserts.push(args);
    rows.push({ orgId: args.create.orgId, role: args.create.role });
    return args.create;
  });
  t.after(async () => { await prisma.$disconnect(); });

  const { protect } = await import("../src/middleware.js");
  const req: any = {
    method: "GET",
    headers: { authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET!)}` },
  };
  let status = 200;
  const res: any = { status: (code: number) => { status = code; return res; }, json: () => res };
  let nextCalled = false;

  await protect(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(status, 200);
  assert.equal(upserts.length, 1);
  assert.deepEqual(upserts[0].create, { userId, orgId: orgA, role: "ADMIN" });
  // the request sees the org and the role the user had
  assert.equal(req.user.orgId, orgA);
  assert.equal(req.user.role, "ADMIN");

  // a user with no org is left alone
  rows.length = 0; upserts.length = 0;
  stub(prisma.user, "findUnique", async () => ({ id: userId, orgId: null, role: "MEMBER", memberships: [] }));
  const req2: any = { ...req, user: undefined };
  await protect(req2, res, () => {});
  assert.equal(upserts.length, 0);
  assert.equal(req2.user.orgId, null);
});
