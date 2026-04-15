import { api } from "./axios";

export const exportApi = {
  connectGoogle: async () => {
    const res = await api.get("/google/connect");
    return res.data;
  },

  syncCompanies: async () => {
    const res = await api.post("/google/sync");
    return res.data;
  },
};