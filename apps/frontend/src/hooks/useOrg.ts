import { useQueryClient, useQuery, useMutation, type QueryClient } from "@tanstack/react-query";
import { orgApi } from "../api/orgApi";
import { useAuthStore, type User } from "../stores/authstore";
import { toast } from "sonner";

// Everything cached on screen belongs to the organization that was open, so
// it is dropped whenever the open organization changes. Only the session
// query stays.
export const clearOrgScopedCache = (queryClient: QueryClient) =>
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "authUser" });

export const useOrg = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore.getState().setUser;

  const { data, isLoading } = useQuery({
    queryKey: ["orgMembers"],
    queryFn: orgApi.getOrgMembers,
    enabled: !!user?.organization,
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApi.createOrg,
    
    onSuccess: async (res) => {
      const updatedUser=res.data.user;
      setUser(updatedUser); //we update the zustand user state with the organization details
      clearOrgScopedCache(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const joinOrgMutation = useMutation({
    mutationFn: orgApi.joinOrg,
    onSuccess: async (res) => {
      
      // Use the response 'res' from the backend, not the 'data' from useQuery
        const updatedUser = res.data.user;
        setUser(updatedUser);
      clearOrgScopedCache(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  // SWITCH ORG
  const switchOrgMutation = useMutation({
    mutationFn: orgApi.switchOrg,
    onSuccess: async (res) => {
      setUser(res.data.user);
      clearOrgScopedCache(queryClient);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to switch organization");
    },
  });

  const removeOrgMemberMutation = useMutation({
    mutationFn: orgApi.removeOrgMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: orgApi.updateMemberRole, // Ensure this exists in your orgApi
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });

  // UPDATE ORG NAME
  const updateOrgMutation = useMutation({
    mutationFn: orgApi.updateOrg,
    onSuccess: (res) => {
      // Update local Zustand state with the new org name
      if (user) {
        setUser({
          ...user,
          organization: {
            ...user.organization!,
            name: res.data.organization.name,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
      toast.success("Workspace updated");
    },
  });

  // After leaving or deleting an org the backend returns the session again:
  // the user is either now in another organization, or in none. With none,
  // OrgRequiredRoute sends them to the create/join screen.
  const afterOrgRemoved = (res: { data: { user: User } }, message: string) => {
    setUser(res.data.user);
    clearOrgScopedCache(queryClient);
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
    toast.success(message);
  };

  // LEAVE ORG
  const leaveOrgMutation = useMutation({
    mutationFn: orgApi.leaveOrg,
    onSuccess: (res) => afterOrgRemoved(res, "Left organization"),
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to leave organization");
    }
  });

  // DELETE ORG
  const deleteOrgMutation = useMutation({
    mutationFn: orgApi.deleteOrg,
    onSuccess: (res) => afterOrgRemoved(res, "Organization permanently deleted"),
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete organization");
    }
  });

  return {
    orgMembers: data?.data?.members || [],
    isOrgMembersLoading: isLoading,

    createOrg: createOrgMutation.mutate,
    joinOrg: joinOrgMutation.mutate,
    switchOrg: switchOrgMutation.mutate,
    isSwitchingOrg: switchOrgMutation.isPending,
    removeOrgMember: removeOrgMemberMutation.mutate,
    updateMemberRole: updateRoleMutation.mutate,

    updateOrg: updateOrgMutation.mutate,
    leaveOrg: leaveOrgMutation.mutate,
    deleteOrg: deleteOrgMutation.mutate,
    
    // Status
    isUpdatingOrg: updateOrgMutation.isPending,
    isLeavingOrg: leaveOrgMutation.isPending,
    isDeletingOrg: deleteOrgMutation.isPending,
  };
};

