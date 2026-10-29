import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma.js";
import {
  MAX_SHEET_BYTES,
  fetchPublicSheet,
  parseSpreadsheetUrl,
  SheetLinkError,
} from "../src/models/googleSheetImport.js";
import { connectGoogle } from "../src/controllers/exportCompaniesController.js";
import companyRoutes from "../src/routes/companyRoutes.js";
import exportRoutes from "../src/routes/exportRoute.js";

const userId = "11111111-1111-4111-8111-111111111111";
const orgId = "33333333-3333-4333-8333-333333333333";
const SHEET = "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUv/edit#gid=0";
const EXPORT = "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUv/export?format=xlsx";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOWNLOAD = "https://doc-08-4o-sheets.googleusercontent.com/export/abc/1AbCdEfGhIjKlMnOpQrStUv?format=xlsx";

// "PK" + some bytes: what every .xlsx (a zip archive) starts with
const fakeXlsx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5, 6, 7, 8]);

const redirect = (location: string, status = 307) =>
  new Response(null, { status, headers: { location } });
const file = (bytes: Buffer = fakeXlsx, headers: Record<string, string> = {}) =>
  new Response(new Uint8Array(bytes), { status: 200, headers: { "content-type": XLSX, ...headers } });
const html = (status = 200) =>
  new Response("<html>Sign in</html>", { status, headers: { "content-type": "text/html; charset=utf-8" } });

/** Replaces fetch for Google addresses, while the test's own calls to the local server still work. */
const stubGoogle = (t: any, handler: (url: string, init: any) => Response | Promise<Response>) => {
  const original = globalThis.fetch;
  const calls: { url: string; init: any }[] = [];
  (globalThis as any).fetch = (input: any, init: any) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("http://127.0.0.1")) return original(input, init);
    calls.push({ url, init });
    return Promise.resolve(handler(url, init));
  };
  t.after(() => { (globalThis as any).fetch = original; });
  return calls;
};

const rejectsWith = (promise: Promise<unknown>, code: string, status: number) =>
  assert.rejects(promise, (e: any) => e instanceof SheetLinkError && e.code === code && e.status === status);

test("parseSpreadsheetUrl", () => {
  assert.deepEqual(
    parseSpreadsheetUrl("https://docs.google.com/spreadsheets/d/abc_123-XY/edit#gid=456"),
    { spreadsheetId: "abc_123-XY", gid: 456 },
  );
  assert.deepEqual(
    parseSpreadsheetUrl("https://docs.google.com/spreadsheets/d/abc123/edit?gid=7"),
    { spreadsheetId: "abc123", gid: 7 },
  );
  assert.equal(parseSpreadsheetUrl("https://evil.example/spreadsheets/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("http://docs.google.com/spreadsheets/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("https://docs.google.com/document/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("not a url"), null);
});

test("downloading a shared sheet", async (t) => {
  await t.test("returns the file, asking Google for a fixed export address only", async (t) => {
    const calls = stubGoogle(t, (url) => (url === EXPORT ? redirect(DOWNLOAD) : file()));
    const result = await fetchPublicSheet(SHEET);

    assert.equal(Buffer.from(result.fileBase64, "base64").equals(fakeXlsx), true);
    assert.equal(result.fileName, "sheet-1AbCdEfG.xlsx");
    assert.deepEqual(calls.map((c) => c.url), [EXPORT, DOWNLOAD]);
    // redirects are followed by us, one checked hop at a time
    assert.ok(calls.every((c) => c.init.redirect === "manual"));
  });

  await t.test("the address the user typed is never requested, only the id is used", async (t) => {
    const calls = stubGoogle(t, () => file());
    await fetchPublicSheet("https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUv/edit?usp=sharing&x=http://evil.example");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.url, EXPORT);
  });

  await t.test("a sheet that is not shared gives a clear 'not shared' error", async (t) => {
    for (const make of [
      () => redirect("https://accounts.google.com/ServiceLogin?continue=x", 302),
      () => html(404),
      () => html(401),
      () => html(403),
      () => html(200), // a sign-in page served with 200
    ]) {
      stubGoogle(t, make);
      await rejectsWith(fetchPublicSheet(SHEET), "SHEET_NOT_PUBLIC", 403);
    }
    await assert.rejects(fetchPublicSheet(SHEET), (e: any) => /Anyone with the link/.test(e.message));
  });

  await t.test("redirects away from Google are refused and never followed", async (t) => {
    for (const target of [
      "https://evil.example/steal",
      "http://doc-08-sheets.googleusercontent.com/insecure",
      "https://googleusercontent.com.evil.example/x",
      "https://169.254.169.254/latest/meta-data",
    ]) {
      const calls = stubGoogle(t, (url) => (url === EXPORT ? redirect(target) : file()));
      await rejectsWith(fetchPublicSheet(SHEET), "SHEET_FETCH_FAILED", 502);
      assert.equal(calls.length, 1, `must not request ${target}`);
    }
  });

  await t.test("a redirect loop stops after a few hops", async (t) => {
    const calls = stubGoogle(t, () => redirect(DOWNLOAD));
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_FETCH_FAILED", 502);
    assert.ok(calls.length <= 5);
  });

  await t.test("files over 5 MB are refused, whether or not Google says how big they are", async (t) => {
    stubGoogle(t, () => file(fakeXlsx, { "content-length": String(MAX_SHEET_BYTES + 1) }));
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_TOO_LARGE", 413);

    const big = Buffer.alloc(MAX_SHEET_BYTES + 10, 0);
    big[0] = 0x50; big[1] = 0x4b;
    stubGoogle(t, () => new Response(new Uint8Array(big), { status: 200, headers: { "content-type": XLSX } }));
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_TOO_LARGE", 413);
  });

  await t.test("something that is not an .xlsx file is refused", async (t) => {
    stubGoogle(t, () => file(Buffer.from("just some text, not a zip")));
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_FETCH_FAILED", 502);
  });

  await t.test("network failures and Google errors become a retryable error", async (t) => {
    stubGoogle(t, () => { throw new TypeError("fetch failed"); });
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_FETCH_FAILED", 502);
    stubGoogle(t, () => html(503));
    await rejectsWith(fetchPublicSheet(SHEET), "SHEET_FETCH_FAILED", 502);
  });

  await t.test("a bad link never reaches Google", async (t) => {
    const calls = stubGoogle(t, () => file());
    await rejectsWith(fetchPublicSheet("https://example.com/spreadsheets/d/abc"), "INVALID_SHEET_URL", 400);
    await rejectsWith(fetchPublicSheet("nonsense"), "INVALID_SHEET_URL", 400);
    assert.equal(calls.length, 0);
  });
});

test("the endpoint: any role can import from a link, and the personal Google connection is gone", async (t) => {
  const before = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "sheet-link-test-secret";
  t.after(() => {
    if (before === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = before;
  });

  let role = "MEMBER";
  const original = {
    user: prisma.user.findUnique,
    org: prisma.organization.findUnique,
  };
  (prisma.user as any).findUnique = async () => ({ id: userId, orgId, memberships: [{ orgId, role }] });
  (prisma.organization as any).findUnique = async () => ({ id: orgId });
  t.after(async () => {
    (prisma.user as any).findUnique = original.user;
    (prisma.organization as any).findUnique = original.org;
    await prisma.$disconnect();
  });

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
  const post = (url: string) =>
    fetch(`${base}/companies/import/google-sheet`, { method: "POST", headers: headers(), body: JSON.stringify({ url }) });

  stubGoogle(t, (url) => (url === EXPORT ? redirect(DOWNLOAD) : file()));

  for (const r of ["MEMBER", "SENIOR", "ADMIN"]) {
    await t.test(`${r} gets the file`, async () => {
      role = r;
      const response = await post(SHEET);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.data.fileName, "sheet-1AbCdEfG.xlsx");
      assert.equal(Buffer.from(body.data.fileBase64, "base64").equals(fakeXlsx), true);
    });
  }

  await t.test("errors carry a code the screen can show", async () => {
    const bad = await post("not a sheet link");
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error, "INVALID_SHEET_URL");

    stubGoogle(t, () => html(404));
    const hidden = await post(SHEET);
    assert.equal(hidden.status, 403);
    assert.equal((await hidden.json()).error, "SHEET_NOT_PUBLIC");
  });

  await t.test("a login is still required", async () => {
    const response = await fetch(`${base}/companies/import/google-sheet`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: SHEET }),
    });
    assert.equal(response.status, 401);
  });

  await t.test("the personal Google connection endpoints no longer exist", async () => {
    assert.equal((await fetch(`${base}/google/connect-import`, { headers: headers() })).status, 404);
    assert.equal((await fetch(`${base}/google/connect-import`, { method: "DELETE", headers: headers() })).status, 404);
  });

  await t.test("organization-wide Connect Google and Sync stay admin-only", async () => {
    role = "MEMBER";
    assert.equal((await fetch(`${base}/google/connect`, { headers: headers() })).status, 403);
    assert.equal((await fetch(`${base}/google/sync`, { method: "POST", headers: headers() })).status, 403);
  });
});

test("Sync asks Google only for access to the spreadsheet SponsCRM creates", (t) => {
  const before = { ...process.env };
  process.env.JWT_SECRET = "sync-scope-test-secret";
  process.env.GOOGLE_CLIENT_ID = "client-id";
  process.env.GOOGLE_CLIENT_SECRET = "client-secret";
  process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/api/v1/google/callback";
  t.after(() => { process.env = before; });

  const res: any = { json: (body: any) => { res.body = body; return res; }, status: () => res };
  connectGoogle({ user: { id: userId, orgId } }, res);

  const scope = new URL(res.body.url).searchParams.get("scope");
  // drive.file is non-sensitive; the broad Sheets scopes would need Google's sensitive-scope review
  assert.equal(scope, "https://www.googleapis.com/auth/drive.file");
});
