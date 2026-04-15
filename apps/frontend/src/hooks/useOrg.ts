import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { orgApi } from "../api/orgApi";
import { useAuthStore } from "../stores/authstore";

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
    
    onSuccess: async () => {
      setUser(data.data.user); //we update the zustand user state with the organization details
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });

  const joinOrgMutation = useMutation({
    mutationFn: orgApi.joinOrg,
    onSuccess: async () => {
      setUser(data.data.user); //we update the zustand user state with the organization details
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
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

  return {
    orgMembers: data?.data?.members || [],
    isOrgMembersLoading: isLoading,

    createOrg: createOrgMutation.mutate,
    joinOrg: joinOrgMutation.mutate,
    removeOrgMember: removeOrgMemberMutation.mutate,
    updateMemberRole: updateRoleMutation.mutate,
  };
};