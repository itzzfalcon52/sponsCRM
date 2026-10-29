import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma.js";
import {
  bulkImportCompanies,
  createCompany,
  getCompanyCreators,
  getMyCompanies,
  listCompanies,
  listCompaniesSchema,
} from "../src/models/companyModule.js";
import companyRoutes from "../src/routes/companyRoutes.js";

const creatorId = "11111111-1111-4111-8111-111111111111";
const memberId = "22222222-2222-4222-8222-222222222222";
const orgId = "33333333-3333-4333-8333-333333333333";
const creator = { id: creatorId, name: null, email: "creator@example.com" };

test("company creators and filters", async (t) => {
  // Stub the database boundary: these checks never read or change a real database.
  const stub = (target: any, key: string, implementation: (...args: any[]) => unknown) => {
    const original = target[key];
    target[key] = implementation;
    t.after(() => { target[key] = original; });
  };
  let listQuery: any;
  let countQuery: any;
  let creatorQuery: any;
  let createQuery: any;
  let role = "ADMIN";
  let currentOrg: string | null = orgId;

  stub(prisma.company, "findMany", async (args: any) => {
    listQuery = args;
    return [];
  });
  stub(prisma.company, "count", async (args: any) => {
    countQuery = args;
    return 23;
  });
  stub(prisma.user, "findMany", async (args: any) => {
    creatorQuery = args;
    return [creator];
  });
  // The organization and role the request sees come from the user's memberships.
  stub(prisma.user, "findUnique", async () => ({
    id: memberId,
    orgId: currentOrg,
    memberships: currentOrg ? [{ orgId: currentOrg, role }] : [],
  }));
  stub(prisma.organization, "findUnique", async () => ({ id: orgId }));
  stub(prisma.company, "create", async (args: any) => {
    createQuery = args;
    return { id: "company-id", ...args.data };
  });
  let createManyQuery: any;
  stub(prisma.company, "createMany", async (args: any) => {
    createManyQuery = args;
    return { count: args.data.length };
  });
  stub(prisma, "$transaction", async (callback: any) => callback(prisma));
  t.after(async () => { await prisma.$disconnect(); });

  await t.test("creator filter combines with search, status, domain and pagination", async () => {
    const result = await listCompanies(orgId, {
      createdBy: creatorId, q: "Acme", status: "CONTACTED", domain: "EDTECH", page: 2, limit: 10,
    });
    assert.equal(listQuery.where.orgId, orgId);
    assert.equal(listQuery.where.createdById, creatorId);
    assert.equal(listQuery.where.status, "CONTACTED");
    assert.equal(listQuery.where.domain, "EDTECH");
    assert.equal(listQuery.where.OR[0].name.contains, "Acme");
    assert.equal(listQuery.skip, 10);
    assert.equal(listQuery.take, 10);
    assert.deepEqual(countQuery.where, listQuery.where);
    assert.equal(result.totalPages, 3);
    assert.deepEqual(listQuery.select.createdBy.select, { id: true, name: true, email: true });
  });

  await t.test("clearing the creator restores all creators", async () => {
    await listCompanies(orgId, {});
    assert.equal(listQuery.where.createdById, undefined);
    assert.equal(listQuery.skip, 0);
  });

  await t.test("invalid creator identifiers are rejected", () => {
    for (const value of ["invalid", [creatorId], { id: creatorId }]) {
      assert.equal(listCompaniesSchema.safeParse({ createdBy: value }).success, false);
    }
  });

  await t.test("member filtering preserves assigned-or-created access and search", async () => {
    await getMyCompanies(memberId, orgId, { createdBy: creatorId, q: "Acme", page: 2, limit: 10 });
    assert.equal(listQuery.where.orgId, orgId);
    assert.equal(listQuery.where.createdById, creatorId);
    assert.deepEqual(listQuery.where.OR, [{ assignedToId: memberId }, { createdById: memberId }]);
    assert.equal(listQuery.where.AND[0].OR[0].name.contains, "Acme");
    assert.deepEqual(countQuery.where, listQuery.where);
    assert.equal(listQuery.skip, 10);
    assert.equal(listQuery.include.createdBy.select.email, true);
  });

  await t.test("creator choices span all pages and include former organization members", async () => {
    await getCompanyCreators(orgId);
    assert.deepEqual(creatorQuery.where, { createdCompanies: { some: { orgId } } });
    assert.deepEqual(creatorQuery.select, { id: true, name: true, email: true });
    assert.equal(creatorQuery.take, undefined);
    assert.equal(creatorQuery.skip, undefined);
  });

  await t.test("member choices are limited to creators of accessible companies", async () => {
    await getCompanyCreators(orgId, memberId);
    assert.deepEqual(creatorQuery.where.createdCompanies.some, {
      orgId, OR: [{ assignedToId: memberId }, { createdById: memberId }],
    });
  });

  await t.test("individual additions store the authenticated creator", async () => {
    await createCompany(creatorId, orgId, { name: "Acme", contactName: "Contact", domain: "EDTECH", status: "NOT_CONTACTED" });
    assert.equal(createQuery.data.createdById, creatorId);
    assert.equal(createQuery.data.assignedToId, creatorId);
    assert.equal(createQuery.data.orgId, orgId);
  });

  await t.test("a client-supplied assignee is ignored on create", async () => {
    await createCompany(creatorId, orgId, {
      name: "Sneaky", contactName: "Contact", domain: "EDTECH", status: "NOT_CONTACTED",
      assignedToId: memberId,
    } as any);
    assert.equal(createQuery.data.assignedToId, creatorId);
  });

  await t.test("bulk imports store the authenticated creator", async () => {
    await bulkImportCompanies(creatorId, orgId, {
      domain: "EDTECH", companies: [{ name: "Imported Acme", contactName: "Contact" }],
    });
    assert.equal(createManyQuery.data[0].createdById, creatorId);
    assert.equal(createManyQuery.data[0].assignedToId, creatorId);
    assert.equal(createManyQuery.data[0].orgId, orgId);
  });

  const secretBefore = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "local-company-creators-regression-test";
  t.after(() => {
    if (secretBefore === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secretBefore;
  });
  const app = express();
  app.use("/companies", companyRoutes);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/companies`;
  const token = jwt.sign({ userId: memberId }, process.env.JWT_SECRET);
  const headers = { authorization: `Bearer ${token}` };

  await t.test("creators route requires authentication", async () => {
    const response = await fetch(`${base}/creators`);
    assert.equal(response.status, 401);
  });

  await t.test("creators route requires an organization", async () => {
    currentOrg = null;
    const response = await fetch(`${base}/creators`, { headers });
    assert.equal(response.status, 403);
    currentOrg = orgId;
  });

  await t.test("admin and senior creators route returns only safe account fields", async () => {
    for (const nextRole of ["ADMIN", "SENIOR"]) {
      role = nextRole;
      const response = await fetch(`${base}/creators`, { headers });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: "success", data: [creator] });
      assert.deepEqual(creatorQuery.where.createdCompanies.some, { orgId });
    }
  });

  await t.test("member creators route applies visibility limits", async () => {
    role = "MEMBER";
    const response = await fetch(`${base}/creators`, { headers });
    assert.equal(response.status, 200);
    assert.deepEqual(creatorQuery.where.createdCompanies.some.OR, [
      { assignedToId: memberId }, { createdById: memberId },
    ]);
  });

  await t.test("both HTTP company lists accept creator filters and return pagination", async () => {
    for (const path of ["", "/me"]) {
      const response = await fetch(`${base}${path}?createdBy=${creatorId}&page=2&limit=10`, { headers });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(listQuery.where.createdById, creatorId);
      assert.deepEqual(body.pagination, { total: 23, page: 2, totalPages: 3 });
    }
  });
});
