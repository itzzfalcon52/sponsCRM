import { useQueryClient, useQuery, useMutation, type QueryClient } from "@tanstack/react-query";
import { orgApi } from "../api/orgApi";
import { useAuthStore, type User } from "../stores/authstore";
import { toast } from "sonner";

// Everything cached on screen belongs to the organization that was open, so
// it is reset whenever the open organization changes. Unlike removeQueries,
// resetQueries also refetches queries a mounted page is still using, so a page
// that stays open never keeps showing the old organization's data. Only the
// session query is kept.
export const clearOrgScopedCache = (queryClient: QueryClient) =>
  queryClient.resetQueries({ predicate: (q) => q.queryKey[0] !== "authUser" });

export const useOrg = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore.getState().setUser;

  // Applies a fresh session (create, join, switch, leave, delete) everywhere
  // it is cached. The cached /me result is replaced too, otherwise useAuth
  // would re-apply the old organization from it until the next refetch.
  const applySession = async (res: { data: { user: User } }) => {
    await queryClient.cancelQueries({ queryKey: ["authUser"] });
    queryClient.setQueryData(["authUser"], res);
    setUser(res.data.user);
    clearOrgScopedCache(queryClient);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["orgMembers"],
    queryFn: orgApi.getOrgMembers,
    enabled: !!user?.organization,
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApi.createOrg,
    
    onSuccess: applySession, // the new organization is now the open one
  });

  const joinOrgMutation = useMutation({
    mutationFn: orgApi.joinOrg,
    // Use the response from the backend, not the 'data' from useQuery
    onSuccess: applySession,
  });

  // SWITCH ORG
  const switchOrgMutation = useMutation({
    mutationFn: orgApi.switchOrg,
    onSuccess: applySession,
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
        const name = res.data.organization.name;
        setUser({
          ...user,
          organization: {
            ...user.organization!,
            name,
          },
          // the switcher lists organizations from here too
          organizations: user.organizations?.map((org) =>
            org.id === user.organization?.id ? { ...org, name } : org
          ),
        });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
      queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
      toast.success("Workspace updated");
    },
  });

  // After leaving or deleting an org the backend returns the session again:
  // the user is either now in another organization, or in none. With none,
  // OrgRequiredRoute sends them to the create/join screen.
  // After leaving or deleting an org the backend returns the session again:
  // the user is either now in another organization, or in none. With none,
  // OrgRequiredRoute sends them to the create/join screen.
  const afterOrgRemoved = async (res: { data: { user: User } }, message: string) => {
    await applySession(res);
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

