// src/api/activityApi.ts
import { api } from "./axios";

export const activityApi = {
  // Create activity
  createActivity: async (data: {
    companyId: string;
    type: "CALL" | "EMAIL" | "MEETING";
    note?: string;
    nextFollowUp?: string;
  }) => {
    const res = await api.post("/activities", data);
    return res.data;
  },

  //  Get activities for a company
  getActivitiesByCompany: async (companyId: string) => {
    const res = await api.get(`/activities/company/${companyId}`);
    return res.data.data.activities;
  },

  // Get all activities (for admin)
    getAllActivities: async () => {
        const res = await api.get("/activities/all");
        return res.data.data.activities;
    },

 // Get follow-ups summary
   getFollowUpsSummary: async () => { 
        const res = await api.get("/activities/followups");
        return res.data.data; 
    }
};