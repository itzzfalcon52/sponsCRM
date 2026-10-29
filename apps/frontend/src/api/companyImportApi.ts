import { api } from "./axios";

export interface BulkImportCompany {
  name: string;
  contactName: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  email?: string;
}

export interface BulkImportPayload {
  domain: string;
  companies: BulkImportCompany[];
}

export interface BulkImportSkippedRow {
  /** 1-based position within the submitted batch */
  row: number;
  name: string;
  reason: "DUPLICATE_IN_SHEET" | "ALREADY_EXISTS";
}

export interface BulkImportResponse {
  status: string;
  message: string;
  data: {
    createdCount: number;
    skipped: BulkImportSkippedRow[];
  };
}

/** A shared Google Sheet, downloaded by the server as an .xlsx file. */
export interface SheetLinkFile {
  fileName: string;
  fileBase64: string;
}

export const companyImportApi = {
  bulkImport: async (
    payload: BulkImportPayload
  ): Promise<BulkImportResponse> => {
    const response = await api.post(
      "/companies/bulk-import",
      payload
    );

    return response.data;
  },

  /** Downloads a sheet shared as "Anyone with the link can view" as an .xlsx file. */
  downloadSheetLink: async (url: string): Promise<SheetLinkFile> => {
    const response = await api.post("/companies/import/google-sheet", { url });

    return response.data.data;
  },
};
