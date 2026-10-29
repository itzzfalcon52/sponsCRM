import { z } from "zod";

/* ============================================================
   IMPORT FROM A SHEET LINK
   Works for sheets shared as "Anyone with the link can view". The server
   downloads the sheet as an .xlsx file (every tab in one file) and hands it
   to the browser, which reads it exactly like an uploaded file. No Google
   sign-in or API access is involved.
   ============================================================ */

export const MAX_SHEET_BYTES = 5 * 1024 * 1024;

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 20_000;
const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export class SheetLinkError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export const googleSheetPreviewSchema = z.object({
  url: z.string().trim().min(1, "Paste a Google Sheets link").max(2048),
});

/**
 * Extracts the spreadsheet id (and tab gid) from a Google Sheets link.
 * Only the id is used afterwards, to build a fixed docs.google.com address,
 * so the server never fetches a user-supplied URL.
 */
export const parseSpreadsheetUrl = (raw: string) => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "docs.google.com") return null;

  const match = url.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;

  const gid = /gid=(\d+)/.exec(url.hash)?.[1] ?? url.searchParams.get("gid");

  return { spreadsheetId: match[1] as string, gid: gid && /^\d+$/.test(gid) ? Number(gid) : null };
};

const notPublic = () =>
  new SheetLinkError(
    403,
    "SHEET_NOT_PUBLIC",
    "SponsCRM can't open this sheet. Share it as \"Anyone with the link can view\", or download it as .xlsx and upload the file instead."
  );

const fetchFailed = (message = "Google didn't return the sheet. Please try again.") =>
  new SheetLinkError(502, "SHEET_FETCH_FAILED", message);

const tooLarge = () =>
  new SheetLinkError(
    413,
    "SHEET_TOO_LARGE",
    "That sheet is over 5 MB. Remove unused tabs or rows and try again."
  );

// Where Google may send the download. Anything else is refused.
const isGoogleDownloadHost = (url: URL) =>
  url.protocol === "https:" &&
  (url.hostname === "docs.google.com" ||
    url.hostname === "drive.google.com" ||
    url.hostname.endsWith(".googleusercontent.com"));

const readLimited = async (response: Response) => {
  const declared = Number(response.headers.get("content-length"));
  if (declared > MAX_SHEET_BYTES) {
    await response.body?.cancel();
    throw tooLarge();
  }

  const reader = response.body?.getReader();
  if (!reader) throw fetchFailed();

  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > MAX_SHEET_BYTES) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks);
};

export const fetchPublicSheet = async (rawUrl: string) => {
  const parsed = parseSpreadsheetUrl(rawUrl);
  if (!parsed) {
    throw new SheetLinkError(400, "INVALID_SHEET_URL", "That doesn't look like a Google Sheets link.");
  }

  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  let current = new URL(
    `https://docs.google.com/spreadsheets/d/${parsed.spreadsheetId}/export?format=xlsx`
  );

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const response = await fetch(current, { redirect: "manual", signal });

      if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();

        const location = response.headers.get("location");
        if (!location) throw fetchFailed();

        const next = new URL(location, current);

        // A sheet that isn't shared is sent to Google's sign-in page.
        if (next.hostname === "accounts.google.com") throw notPublic();
        if (!isGoogleDownloadHost(next)) throw fetchFailed();

        current = next;
        continue;
      }

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        await response.body?.cancel();
        throw notPublic();
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw fetchFailed();
      }

      // An HTML page here is a sign-in or error page, not the spreadsheet.
      if (!(response.headers.get("content-type") ?? "").startsWith(XLSX_TYPE)) {
        await response.body?.cancel();
        throw notPublic();
      }

      const bytes = await readLimited(response);

      // .xlsx files are zip archives
      if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw fetchFailed();

      return {
        fileName: `sheet-${parsed.spreadsheetId.slice(0, 8)}.xlsx`,
        fileBase64: bytes.toString("base64"),
      };
    }

    throw fetchFailed();
  } catch (error) {
    if (error instanceof SheetLinkError) throw error;

    if ((error as { name?: string })?.name === "TimeoutError") {
      throw fetchFailed("Google took too long to respond. Please try again.");
    }

    throw fetchFailed();
  }
};
