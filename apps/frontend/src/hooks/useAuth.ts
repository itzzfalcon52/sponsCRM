import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authstore";
import { authApi } from "../api/authApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // Store Actions
    const setUser = useAuthStore((state) => state.setUser);
    const logoutStore = useAuthStore((state) => state.logout);

    /**
     * 1. SESSION MANAGEMENT (GET /ME)
     * Fetches user data on app load and keeps Zustand in sync.
     */
    const { data, isLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: authApi.me,
        retry: false, 
    });

    useEffect(() => {
        if (data?.data?.user) {
            setUser(data.data.user);
        }
        if (!isLoading && !data?.data?.user) {
            setUser(null);
        }
    }, [data, isLoading, setUser]);

    const user = data?.data?.user || null;

    /**
     * 2. LOGIN & SIGNUP
     */
    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (res) => {
            setUser(res.data.user);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            toast.success("Welcome back!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Login failed");
        }
    });

    const signUpMutation = useMutation({
        mutationFn: authApi.signUp,
        onSuccess: (res) => {
            setUser(res.data.user);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            toast.success("Account created successfully!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Signup failed");
        }
    });

    /**
     * 3. PROFILE & PASSWORD MANAGEMENT
     */
    const updateProfileMutation = useMutation({
        mutationFn: (payload: { name: string }) => authApi.updateProfile(payload),
        onSuccess: (res) => {
            // Update local store immediately so UI reflects name change
            setUser(res.data.user);
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            toast.success("Profile updated");
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (payload: any) => authApi.changePassword(payload),
        onSuccess: () => {
            // Backend clears cookie on pass change, so we must clear local state
            logoutStore();
            queryClient.clear();
            navigate("/login");
            toast.success("Password changed. Please log in again.");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to change password");
        }
    });

    /**
     * 4. LOGOUT & ACCOUNT DELETION
     */
    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            logoutStore();
            queryClient.removeQueries({ queryKey: ['authUser'] });
            queryClient.clear(); 
            navigate("/", { replace: true });
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: authApi.deleteAccount,
        onSuccess: () => {
            logoutStore();
            queryClient.clear();
            navigate("/", { replace: true });
            toast.success("Account permanently deleted.");
        },
    });

    return {
        // Data
        user,
        isLoading,
        isAuthenticated: !!user,

        // Auth Actions
        login: loginMutation.mutateAsync,
        signUp: signUpMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,

        // Profile Actions
        updateProfile: updateProfileMutation.mutateAsync,
        changePassword: changePasswordMutation.mutateAsync,
        deleteAccount: deleteAccountMutation.mutateAsync,

        // Loading States
        isLoggingIn: loginMutation.isPending,
        isSigningUp: signUpMutation.isPending,
        isUpdatingProfile: updateProfileMutation.isPending,
        isChangingPassword: changePasswordMutation.isPending,
        isDeletingAccount: deleteAccountMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
    };
};