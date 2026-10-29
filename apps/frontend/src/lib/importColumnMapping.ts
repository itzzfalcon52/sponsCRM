/* ============================================================
   Maps the columns of an arbitrary spreadsheet onto CRM fields.
   Everything here is pure so it can be tested without a browser.
   ============================================================ */

export type ImportField =
  | "name"
  | "contactName"
  | "email"
  | "phoneNumber"
  | "linkedinUrl";

export const IMPORT_FIELDS: { key: ImportField; label: string; required?: boolean }[] = [
  { key: "name", label: "Company name", required: true },
  { key: "contactName", label: "POC name" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "Phone" },
  { key: "linkedinUrl", label: "LinkedIn" },
];

/** Column index per field, or null when the field is not in the sheet. */
export type ColumnMapping = Record<ImportField, number | null>;

export const emptyMapping = (): ColumnMapping => ({
  name: null,
  contactName: null,
  email: null,
  phoneNumber: null,
  linkedinUrl: null,
});

export const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

// More specific fields first so "POC Email" is an email, not a POC name.
const FIELD_ORDER: ImportField[] = [
  "email",
  "phoneNumber",
  "linkedinUrl",
  "name",
  "contactName",
];

// Whole-header matches (after normalizeHeader).
const EXACT: Record<ImportField, string[]> = {
  name: [
    "company", "companyname", "organisation", "organization", "organisationname",
    "organizationname", "org", "orgname", "brand", "brandname", "sponsor",
    "sponsorname", "firm", "businessname", "startup", "startupname",
  ],
  contactName: [
    "poc", "pocname", "contact", "contactperson", "contactname", "spoc",
    "personname", "representative", "pointofcontact",
  ],
  email: ["email", "mail", "emailid", "emailaddress", "mailid", "pocemail", "contactemail"],
  phoneNumber: [
    "phone", "phonenumber", "phoneno", "mobile", "mobilenumber", "mobileno", "mob",
    "contactno", "contactnumber", "number", "whatsapp", "whatsappnumber",
    "pocphone", "pocnumber", "pocmobile",
  ],
  linkedinUrl: ["linkedin", "linkedinurl", "linkedinprofile", "linkedinlink", "linkedinid", "profile", "profilelink"],
};

// Substring matches, for headers like "Company Name (as per website)".
const PARTIAL: Record<ImportField, string[]> = {
  name: ["company", "organisation", "organization", "brand", "sponsor"],
  contactName: ["poc", "contactperson", "contactname"],
  email: ["email", "mail"],
  phoneNumber: ["phone", "mobile", "whatsapp", "contactno", "contactnumber"],
  linkedinUrl: ["linkedin"],
};

const fieldForHeader = (normalized: string): ImportField | null => {
  if (!normalized) return null;
  for (const field of FIELD_ORDER) if (EXACT[field].includes(normalized)) return field;
  for (const field of FIELD_ORDER) {
    if (PARTIAL[field].some((alias) => normalized.includes(alias))) return field;
  }
  return null;
};

const MAX_HEADER_SCAN = 10;

// Headers are short labels; emails, links, phone numbers and sentences are data.
const looksLikeHeaderText = (cell: string) =>
  cell.length <= 50 &&
  !cell.includes("@") &&
  !/https?:|www\.|\.com\b/i.test(cell) &&
  cell.replace(/\D/g, "").length < 5;

/**
 * Index of the header row, or -1 when nothing looks like a header.
 * Sheets often start with a title row, so the first few rows are scanned.
 */
export const detectHeaderRow = (rows: string[][]): number => {
  let best = -1;
  let bestScore = 0;

  for (let i = 0; i < Math.min(rows.length, MAX_HEADER_SCAN); i++) {
    const score = rows[i].filter(
      (cell) => looksLikeHeaderText(cell) && fieldForHeader(normalizeHeader(cell))
    ).length;
    if (score >= 2) return i;
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }

  return best;
};

export const columnCount = (rows: string[][]) =>
  rows.slice(0, 50).reduce((max, row) => Math.max(max, row.length), 0);

const columnLetter = (index: number) => {
  let n = index;
  let letter = "";
  do {
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letter;
};

/** Display names for the mapping dropdowns. */
export const columnLabels = (rows: string[][], headerRow: number): string[] => {
  const count = columnCount(rows);
  return Array.from({ length: count }, (_, i) => {
    const header = headerRow >= 0 ? (rows[headerRow]?.[i] ?? "").trim() : "";
    return header || `Column ${columnLetter(i)}`;
  });
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (value: string) => EMAIL.test(value);

const looksLikePhone = (value: string) =>
  /^\+?[\d\s\-().]+$/.test(value) && value.replace(/\D/g, "").length >= 7;

const dataSamples = (rows: string[][], headerRow: number, col: number) =>
  rows
    .slice(headerRow + 1, headerRow + 1 + 50)
    .map((row) => (row[col] ?? "").trim())
    .filter(Boolean);

const mostly = (values: string[], test: (v: string) => boolean, ratio = 0.6) =>
  values.length > 0 && values.filter(test).length / values.length >= ratio;

export const guessMapping = (rows: string[][], headerRow: number): ColumnMapping => {
  const mapping = emptyMapping();
  const used = new Set<number>();
  const headers = columnLabels(rows, headerRow);
  const normalized = headerRow >= 0 ? headers.map(normalizeHeader) : headers.map(() => "");

  const assign = (field: ImportField, col: number) => {
    mapping[field] = col;
    used.add(col);
  };

  // 1. whole-header matches
  normalized.forEach((header, col) => {
    const field = FIELD_ORDER.find((f) => mapping[f] === null && EXACT[f].includes(header));
    if (header && field) assign(field, col);
  });

  // 2. substring matches
  normalized.forEach((header, col) => {
    if (used.has(col) || !header) return;
    const field = FIELD_ORDER.find(
      (f) => mapping[f] === null && PARTIAL[f].some((alias) => header.includes(alias))
    );
    if (field) assign(field, col);
  });

  // 3. a bare "Name" column is the company, or the POC when a company column exists
  normalized.forEach((header, col) => {
    if (used.has(col) || header !== "name") return;
    if (mapping.name === null) assign("name", col);
    else if (mapping.contactName === null) assign("contactName", col);
  });

  // 4. look at the values of columns that still have no field
  headers.forEach((_, col) => {
    if (used.has(col)) return;
    const samples = dataSamples(rows, headerRow, col);
    if (mapping.email === null && mostly(samples, isEmail)) assign("email", col);
    else if (mapping.linkedinUrl === null && mostly(samples, (v) => /linkedin\.com/i.test(v), 0.5))
      assign("linkedinUrl", col);
    else if (mapping.phoneNumber === null && mostly(samples, looksLikePhone)) assign("phoneNumber", col);
  });

  // No header at all: assume the first column is the company.
  if (headerRow < 0 && mapping.name === null && !used.has(0) && headers.length) assign("name", 0);

  return mapping;
};

/* ============================================================
   ROWS
   ============================================================ */

export interface ImportRow {
  /** 1-based row number in the sheet, as the user sees it */
  sheetRow: number;
  name: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  linkedinUrl: string;
  /** Domain enum value chosen for the whole sheet */
  domain: string;
  error: string | null;
  /** Sheet row of the first company with the same name, when this is a repeat */
  duplicateOf: number | null;
}

export const normalizeCompanyName = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

export const buildImportRows = (
  rows: string[][],
  headerRow: number,
  mapping: ColumnMapping,
  sector: string
): ImportRow[] => {
  const cell = (row: string[], col: number | null) =>
    col === null ? "" : (row[col] ?? "").trim();

  const result: ImportRow[] = [];
  const firstSeen = new Map<string, number>();

  rows.slice(headerRow + 1).forEach((row, offset) => {
    const mapped = (Object.keys(mapping) as ImportField[]).map((f) => cell(row, mapping[f]));
    if (mapped.every((v) => !v)) return;

    const sheetRow = headerRow + 2 + offset;
    const name = cell(row, mapping.name).replace(/\s+/g, " ");
    // Cells sometimes hold several addresses; keep the first.
    const email = cell(row, mapping.email).split(/[,;\s]+/)[0] ?? "";

    let error: string | null = null;
    if (!name) error = "Company name is missing";
    else if (name.length > 255) error = "Company name is too long";
    else if (email && !isEmail(email)) error = "Invalid email address";
    else if (!sector) error = "Pick a sector";

    let duplicateOf: number | null = null;
    if (!error) {
      const key = normalizeCompanyName(name);
      const first = firstSeen.get(key);
      if (first === undefined) firstSeen.set(key, sheetRow);
      else duplicateOf = first;
    }

    result.push({
      sheetRow,
      name,
      contactName: cell(row, mapping.contactName).slice(0, 100),
      email,
      phoneNumber: cell(row, mapping.phoneNumber),
      linkedinUrl: cell(row, mapping.linkedinUrl),
      domain: sector,
      error,
      duplicateOf,
    });
  });

  return result;
};
