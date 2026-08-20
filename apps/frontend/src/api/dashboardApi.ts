import { api } from "./axios";

export const dashboardApi = {
  getAdminStats: async () => {
    const response = await api.get(
      "/dashboard/stats"
    );

    return response.data;
  },
};