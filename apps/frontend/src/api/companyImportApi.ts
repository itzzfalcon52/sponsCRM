import { api } from "./axios";
import type { User } from "../stores/authstore";

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

export interface GoogleSheetPreview {
  tabs: string[];
  selectedTab: string;
  rows: string[][];
  truncated: boolean;
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

  previewGoogleSheet: async (
    url: string,
    sheetTitle?: string
  ): Promise<GoogleSheetPreview> => {
    const response = await api.post("/companies/import/google-sheet", {
      url,
      sheetTitle,
    });

    return response.data.data;
  },

  /** Where to send the person to connect their own Google account (read-only). */
  connectGoogleForImport: async (): Promise<string> => {
    const response = await api.get("/google/connect-import");

    return response.data.url;
  },

  /** Forgets this person's Google connection. Returns the updated session. */
  disconnectGoogleForImport: async (): Promise<{ data: { user: User } }> => {
    const response = await api.delete("/google/connect-import");

    return response.data;
  },
};
