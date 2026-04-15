import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityApi } from "../api/activityApi";
import { toast } from "sonner";

export const useActivity = (companyId?: string) => {
  const queryClient = useQueryClient();

  /**
   *  GET ACTIVITIES (timeline)
   */
  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
  } = useQuery({
    queryKey: ["activities", companyId],
    queryFn: async () => {
      const res = await activityApi.getActivitiesByCompany(companyId!);
      // Safely extract the array whether it is nested in .data or not
      return res?.data?.data?.activities || res?.data || res || [];
    },
    enabled: !!companyId,
  });

  ///  GET ALL ACTIVITIES (for admin dashboard)
  const { 
    data: allActivities = [], 
    isLoading: isAllActivitiesLoading 
  } = useQuery({
    queryKey: ["allActivities"],
    queryFn: async () => {
      const res = await activityApi.getAllActivities();
      return res?.data?.data?.activities || res?.data || res || [];
    },
  });

  ///  GET FOLLOW-UPS SUMMARY (for dashboard)
  const { 
    data: followUpsSummary = { overdue: [], today: [] }, 
    isLoading: isFollowUpsLoading 
  } = useQuery({
    queryKey: ["followUpsSummary"],
    queryFn: async () => {
      const payload = await activityApi.getFollowUpsSummary()
      
      // Return guaranteed non-undefined valid shape
      return {
        overdue: payload.overdue ?? [],
        today: payload.today ?? []
      };
    },
  });

  /**
   *  CREATE ACTIVITY
   */
  const { mutate: createActivity, isPending: isCreating } = useMutation({
    mutationFn: activityApi.createActivity,

    onSuccess: () => {
      toast.success("Activity logged successfully");

      //  refetch activities (timeline)
      queryClient.invalidateQueries({
        queryKey: ["activities", companyId],
      });

      //  refetch companies and follow-ups
      queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
      queryClient.invalidateQueries({
         queryKey: ["followUpsSummary"] 
      });
    },

    onError: () => {
      toast.error("Failed to log activity");
    },
  });

  return {
    overdue: followUpsSummary?.overdue ?? [],
    today: followUpsSummary?.today ?? [],
    allActivities,
    isLoading: isActivitiesLoading || isFollowUpsLoading || isAllActivitiesLoading || isCreating,
    activities,
    createActivity,
  };
};