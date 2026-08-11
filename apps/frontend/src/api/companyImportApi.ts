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

export const companyImportApi = {
  bulkImport: async (
    payload: BulkImportPayload
  ) => {
    const response = await api.post(
      "/companies/bulk-import",
      payload
    );

    return response.data;
  },
};