import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../src/lib/prisma.js";
import { bulkImportCompanies } from "../src/models/companyModule.js";
import { parseSpreadsheetUrl } from "../src/models/googleSheetImport.js";

const userId = "11111111-1111-4111-8111-111111111111";
const orgId = "33333333-3333-4333-8333-333333333333";

test("parseSpreadsheetUrl", () => {
  assert.deepEqual(
    parseSpreadsheetUrl("https://docs.google.com/spreadsheets/d/abc_123-XY/edit#gid=456"),
    { spreadsheetId: "abc_123-XY", gid: 456 }
  );
  assert.deepEqual(
    parseSpreadsheetUrl("https://docs.google.com/spreadsheets/d/abc123/edit?gid=7"),
    { spreadsheetId: "abc123", gid: 7 }
  );
  assert.deepEqual(parseSpreadsheetUrl("https://docs.google.com/spreadsheets/d/abc123"), {
    spreadsheetId: "abc123",
    gid: null,
  });
  assert.equal(parseSpreadsheetUrl("https://evil.example/spreadsheets/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("http://docs.google.com/spreadsheets/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("https://docs.google.com/document/d/abc123"), null);
  assert.equal(parseSpreadsheetUrl("not a url"), null);
});

test("bulk import skips duplicates and tolerates blank POC", async (t) => {
  let findQuery: any;
  let createManyQuery: any;
  const originals = {
    findMany: prisma.company.findMany,
    createMany: prisma.company.createMany,
  };
  (prisma.company as any).findMany = async (args: any) => {
    findQuery = args;
    return [{ name: "already  Here" }];
  };
  (prisma.company as any).createMany = async (args: any) => {
    createManyQuery = args;
    return { count: args.data.length };
  };
  t.after(async () => {
    (prisma.company as any).findMany = originals.findMany;
    (prisma.company as any).createMany = originals.createMany;
    await prisma.$disconnect();
  });

  const result = await bulkImportCompanies(userId, orgId, {
    domain: "EDTECH",
    companies: [
      { name: "Acme", contactName: "" },
      { name: "  acme  ", contactName: "Someone" },
      { name: "Already Here", contactName: "X" },
      { name: "Globex", contactName: "Jo" },
    ],
  });

  assert.equal(result.createdCount, 2);
  assert.deepEqual(result.skipped, [
    { row: 2, name: "  acme  ".trim(), reason: "DUPLICATE_IN_SHEET" },
    { row: 3, name: "Already Here", reason: "ALREADY_EXISTS" },
  ]);
  assert.equal(findQuery.where.orgId, orgId);
  assert.equal(createManyQuery.skipDuplicates, true);
  assert.deepEqual(
    createManyQuery.data.map((c: any) => [c.name, c.contactName, c.domain]),
    [
      ["Acme", "", "EDTECH"],
      ["Globex", "Jo", "EDTECH"],
    ]
  );
});
