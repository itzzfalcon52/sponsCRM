import { useQuery, useMutation, useQueryClient,useInfiniteQuery} from "@tanstack/react-query";
import { companyApi } from "../api/companyApi";
import { useAuthStore } from "../stores/authstore";
import { toast } from "sonner";

export const useCompanies = (filters?: any) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const isAdminOrSenior = user?.role === "ADMIN" || user?.role === "SENIOR";

  // Base key targets EVERYTHING related to companies
  const baseQueryKey = ["companies"];
  // Specific key targets the exact filter state currently active
  const queryKey = ["companies", filters];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      isAdminOrSenior
        ? companyApi.getCompanies(filters)//  Pass filters to the main companies endpoint
        : companyApi.getMyCompanies(filters), //  Pass filters to the my companies endpoint as well
    enabled: !!user?.organization,
    // Prevents UI flashing (loading skeletons) when just changing filters/searching
    placeholderData: (previousData) => previousData,
  });

  

  // ========================
  // CREATE
  // ========================
  const createMutation = useMutation({
    mutationFn: companyApi.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
    onError: (error: any) => {
      // Catch specific backend error messages (e.g. "Company already exists")
      const errorMessage = error?.response?.data?.message || "Failed to create company.";
      toast.error(errorMessage);
    },
  });

  // ========================
  // UPDATE 
  // ========================
  const updateMutation = useMutation({
    mutationFn: companyApi.updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
    onError: (error: any) => {
      // Catch specific backend error messages (e.g. "Company already exists")
      const errorMessage = error?.response?.data?.message || "Failed to update company.";
      toast.error(errorMessage);
    },
  });

  // ========================
  // DELETE
  // ========================
  const deleteMutation = useMutation({
    mutationFn: companyApi.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });

  // ========================
  // ASSIGN 
  // ========================
  const assignMutation = useMutation({
    mutationFn: companyApi.assignCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });

  // ========================
  // BULK ASSIGN
  // ========================
  const bulkAssignMutation = useMutation({
    mutationFn: companyApi.bulkAssign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });

  return {
    companies: data?.data || [],
    pagination: data?.pagination,
    isLoading, // Shows initial load skeleton

    createCompany: createMutation.mutate,
    updateCompany: updateMutation.mutate,
    deleteCompany: deleteMutation.mutate,
    assignCompany: assignMutation.mutate,
    bulkAssign: bulkAssignMutation.mutate,
  };
};

export const useInfiniteCompanies = (filters: any) => {
  const user = useAuthStore((s) => s.user);
  const isAdminOrSenior = user?.role === "ADMIN" || user?.role === "SENIOR";

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
        ? companyApi.getCompanies({ ...filters, page: pageParam as number, limit: 20 })
        : companyApi.getMyCompanies({ ...filters, page: pageParam as number, limit: 20 }), 
    initialPageParam: 1, // <-- Add this line for Tanstack Query v5
    getNextPageParam: (lastPage: any) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!user?.organization,
  });

  return {
    // Flatten all pages into a single array of companies
    companies: data?.pages.flatMap((page) => page.data) || [],
    // Safely get total items from the first page's pagination context
    totalItems: data?.pages[0]?.pagination?.total || 0,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};