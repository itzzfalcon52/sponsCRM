import { z } from "zod";
import {
  clearUserGoogleToken,
  getSheetsClientFor,
  GoogleImportError,
  type SheetsSource,
} from "../utils/googleSheetsClient.js";

export const MAX_SHEET_ROWS = 2000;

export const googleSheetPreviewSchema = z.object({
  url: z.string().trim().min(1, "Paste a Google Sheets link").max(2048),
  sheetTitle: z.string().trim().max(255).optional(),
});

/**
 * Extracts the spreadsheet id (and tab gid) from a Google Sheets link.
 * Only the id is used afterwards, and only against the Sheets API, so the
 * server never fetches a user-supplied URL.
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

  return { spreadsheetId: match[1], gid: gid && /^\d+$/.test(gid) ? Number(gid) : null };
};

const toGoogleImportError = (err: any, source: SheetsSource | null) => {
  if (err instanceof GoogleImportError) return err;

  if (err?.response?.data?.error === "invalid_grant") {
    return new GoogleImportError(
      401,
      "GOOGLE_RECONNECT_REQUIRED",
      source === "user"
        ? "Your Google connection expired. Connect your Google account again."
        : "Your Google connection has expired. Please reconnect Google."
    );
  }

  const status = err?.code ?? err?.response?.status;
  if (status === 403 || status === 404) {
    return new GoogleImportError(
      403,
      "SHEET_NO_ACCESS",
      "SponsCRM can't open this sheet. Share it with the Google account you connected, or upload it as a file."
    );
  }

  return err;
};

export const readGoogleSheet = async (
  userId: string,
  orgId: string,
  input: z.infer<typeof googleSheetPreviewSchema>
) => {
  const parsed = parseSpreadsheetUrl(input.url);
  if (!parsed) {
    throw new GoogleImportError(
      400,
      "INVALID_SHEET_URL",
      "That doesn't look like a Google Sheets link."
    );
  }

  let source: SheetsSource | null = null;

  try {
    const client = await getSheetsClientFor(userId, orgId);
    const sheets = client.sheets;
    source = client.source;

    const meta = await sheets.spreadsheets.get({
      spreadsheetId: parsed.spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    });

    const tabs = (meta.data.sheets ?? [])
      .map((s) => s.properties)
      .filter((p): p is NonNullable<typeof p> => !!p?.title);

    if (!tabs.length) {
      throw new GoogleImportError(404, "SHEET_EMPTY", "This spreadsheet has no tabs.");
    }

    const byTitle = input.sheetTitle
      ? tabs.find((t) => t.title === input.sheetTitle)
      : undefined;
    const byGid =
      parsed.gid !== null ? tabs.find((t) => t.sheetId === parsed.gid) : undefined;
    const selected = byTitle ?? byGid ?? tabs[0]!;

    // Quote the title so tab names with spaces or punctuation resolve as a range.
    const range = `'${selected.title!.replace(/'/g, "''")}'`;

    const values = await sheets.spreadsheets.values.get({
      spreadsheetId: parsed.spreadsheetId,
      range,
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = (values.data.values ?? [])
      .slice(0, MAX_SHEET_ROWS)
      .map((row) => row.map((cell) => String(cell ?? "")));

    return {
      tabs: tabs.map((t) => t.title!),
      selectedTab: selected.title!,
      rows,
      truncated: (values.data.values?.length ?? 0) > MAX_SHEET_ROWS,
    };
  } catch (err: any) {
    // A token Google no longer accepts is useless: forget it so the person is
    // asked to connect again instead of failing the same way every time.
    if (source === "user" && err?.response?.data?.error === "invalid_grant") {
      await clearUserGoogleToken(userId).catch(() => undefined);
    }

    throw toGoogleImportError(err, source);
  }
};
