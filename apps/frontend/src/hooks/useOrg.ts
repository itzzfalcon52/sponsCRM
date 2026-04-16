import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { orgApi } from "../api/orgApi";
import { useAuthStore } from "../stores/authstore";
import { toast } from "sonner";

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
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.invalidateQueries({ queryKey: ["orgMembers"] });
    },
  });

  const joinOrgMutation = useMutation({
    mutationFn: orgApi.joinOrg,
    onSuccess: async (res) => {
      
      // Use the response 'res' from the backend, not the 'data' from useQuery
        const updatedUser = res.data.user;
        setUser(updatedUser);
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

  // LEAVE ORG
  const leaveOrgMutation = useMutation({
    mutationFn: orgApi.leaveOrg,
    onSuccess: () => {
      // Crucial: Clear the user/org state locally
      setUser(null); 
      queryClient.clear(); // Wipe cache to prevent data leakage
      toast.success("Left organization");
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to leave organization");
    }
  });

  // DELETE ORG
  const deleteOrgMutation = useMutation({
    mutationFn: orgApi.deleteOrg,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast.success("Organization permanently deleted");
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete organization");
    }
  });

  return {
    orgMembers: data?.data?.members || [],
    isOrgMembersLoading: isLoading,

    createOrg: createOrgMutation.mutate,
    joinOrg: joinOrgMutation.mutate,
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

