import { api } from "./axios";

export const authApi = {
    // 1. Login
    login: async (data: { email: string; password: string }) => {
        const res = await api.post("/auth/login", data);
        return res.data;
    },

    // 2. Signup
    signUp: async (data: { email: string; password: string; name: string }) => {
        const res = await api.post("/auth/register", data);
        return res.data;
    },

    // 3. Logout
    logout: async () => {
        const res = await api.post("/auth/logout");
        return res.data;
    },

    // 4. Get current user data
    me: async () => {
        const res = await api.get("/auth/me");
        return res.data;
    },

    /**
     * NEW: PROFILE & ACCOUNT MANAGEMENT
     */

    // 5. Update Profile Details (e.g., Name)
    updateProfile: async (data: { name: string }) => {
        const res = await api.patch("/auth/update-me", data);
        return res.data;
    },

    // 6. Change Password (Internal Reset)
    changePassword: async (data: any) => {
        const res = await api.patch("/auth/change-password", data);
        return res.data;
    },

    // 7. Delete Personal Account
    deleteAccount: async () => {
        const res = await api.delete("/auth/delete-me");
        return res.data;
    }
};