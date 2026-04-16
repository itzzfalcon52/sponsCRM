import { api } from "./axios";

export const notifApi = {
    getUnread: async () => {
        const res = await api.get("/notifications");
        return res.data;
    },
    markRead: async (id: string) => {
        const res = await api.patch(`/notifications/${id}/read`);
        return res.data;
    },
    markAllRead: async () => {
        const res = await api.patch("/notifications/mark-all");
        return res.data;
    }
};