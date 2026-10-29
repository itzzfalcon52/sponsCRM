import Papa from "papaparse";
import readExcelFile from "read-excel-file/browser";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_SHEET_ROWS = 2000;

export interface ParsedSheet {
  name: string;
  rows: string[][];
}

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

const clean = (rows: unknown[][]) =>
  rows
    .slice(0, MAX_SHEET_ROWS)
    .map((row) => row.map(toText));

/** Reads an .xlsx or .csv file into one or more sheets of plain text cells. */
export const parseSpreadsheetFile = async (file: File): Promise<ParsedSheet[]> => {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("That file is over 5 MB. Remove unused tabs or rows and try again.");
  }

  const name = file.name.toLowerCase();

  if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
    const parsed = Papa.parse<string[]>(await file.text(), { skipEmptyLines: "greedy" });
    return [{ name: file.name, rows: clean(parsed.data) }];
  }

  if (name.endsWith(".xlsx")) {
    const sheets = await readExcelFile(file);
    return sheets.map((sheet) => ({ name: sheet.sheet, rows: clean(sheet.data) }));
  }

  throw new Error("Upload an .xlsx or .csv file. In Google Sheets use File → Download.");
};
