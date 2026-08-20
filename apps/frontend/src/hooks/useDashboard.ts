import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboardApi";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "admin", "stats"],
    queryFn: dashboardApi.getAdminStats,
  });
};