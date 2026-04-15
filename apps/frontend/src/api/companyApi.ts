import { api } from "./axios";

export const companyApi = {
  getCompanies: async (params?: any) => {
    const res = await api.get("/companies", { params });
    return res.data;
  },

  getMyCompanies: async (params?:any) => {
    const res = await api.get("/companies/me",{params});
    return res.data;
  },

  createCompany: async (data: any) => {
    const res = await api.post("/companies", data);
    return res.data;
  },

  updateCompany: async ({ id, data }: any) => {
    const res = await api.patch(`/companies/${id}`, data);
    return res.data;
  },

  deleteCompany: async (id: string) => {
    const res = await api.delete(`/companies/${id}`);
    return res.data;
  },

  assignCompany: async ({ id, assignedToId }: any) => {
    const res = await api.patch(`/companies/${id}/assign`, {
      assignedToId,
    });
    return res.data;
  },

  bulkAssign: async (data: {
    companyIds: string[];
    assignedToId: string | null;
  }) => {
    const res = await api.patch("/companies/bulk-assign", data);
    return res.data;
  },
};