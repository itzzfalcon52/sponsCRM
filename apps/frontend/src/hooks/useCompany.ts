import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { companyApi } from "../api/companyApi";
import { useAuthStore } from "../stores/authstore";
import { toast } from "sonner";

export const useCompanies = (filters?: any) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  // ============================================================
  // QUERY KEYS
  // ============================================================

  const baseQueryKey = ["companies"];
  const queryKey = ["companies", filters];

  // ============================================================
  // FETCH COMPANIES
  // ============================================================

  const { data, isLoading } = useQuery({
    queryKey,

    queryFn: () =>
      isAdminOrSenior
        ? companyApi.getCompanies(filters)
        : companyApi.getMyCompanies(filters),

    enabled: !!user?.organization,

    // Prevent UI flashing while changing filters
    placeholderData: (previousData) => previousData,
  });

  // ============================================================
  // CREATE
  // ============================================================

  const createMutation = useMutation({
    mutationFn: companyApi.createCompany,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to create company.";

      toast.error(message);
    },
  });

  // ============================================================
  // UPDATE
  // ============================================================

  const updateMutation = useMutation({
    mutationFn: companyApi.updateCompany,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update company.";

      toast.error(message);
    },
  });

  // ============================================================
  // DELETE
  // ============================================================

  const deleteMutation = useMutation({
    mutationFn: companyApi.deleteCompany,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to delete company.";

      toast.error(message);
    },
  });

  // ============================================================
  // ASSIGN
  // ============================================================

  const assignMutation = useMutation({
    mutationFn: companyApi.assignCompany,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to assign company.";

      toast.error(message);
    },
  });

  // ============================================================
  // BULK ASSIGN
  // ============================================================

  const bulkAssignMutation = useMutation({
    mutationFn: companyApi.bulkAssign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
      });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to assign companies.";

      toast.error(message);
    },
  });

  // ============================================================
  // RETURN
  // ============================================================

  return {
    companies: data?.data || [],
    pagination: data?.pagination,
    isLoading,

    createCompany: createMutation.mutate,
    updateCompany: updateMutation.mutate,
    deleteCompany: deleteMutation.mutate,

    assignCompany: assignMutation.mutate,
    bulkAssign: bulkAssignMutation.mutate,
  };
};

// ================================================================
// INFINITE COMPANIES
// ================================================================

export const useInfiniteCompanies = (filters: any) => {
  const user = useAuthStore((s) => s.user);

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["companies", "infinite", filters],

    queryFn: ({ pageParam }) =>
      isAdminOrSenior
        ? companyApi.getCompanies({
            ...filters,
            page: pageParam as number,
            limit: 20,
          })
        : companyApi.getMyCompanies({
            ...filters,
            page: pageParam as number,
            limit: 20,
          }),

    // TanStack Query v5
    initialPageParam: 1,

    getNextPageParam: (lastPage: any) => {
      const currentPage =
        lastPage?.pagination?.page;

      const totalPages =
        lastPage?.pagination?.totalPages;

      if (
        currentPage &&
        totalPages &&
        currentPage < totalPages
      ) {
        return currentPage + 1;
      }

      return undefined;
    },

    enabled: !!user?.organization,
  });

  return {
    // Flatten all pages
    companies:
      data?.pages.flatMap(
        (page) => page.data
      ) || [],

    // Total number of companies
    totalItems:
      data?.pages[0]?.pagination?.total || 0,

    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};