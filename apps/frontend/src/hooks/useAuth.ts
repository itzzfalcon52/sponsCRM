import { useQueryClient,useQuery,useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authstore";
import { authApi } from "../api/authApi";
import { useEffect } from "react";


export const useAuth = () => {
    const queryClient = useQueryClient();
    const setUser= useAuthStore((state) => state.setUser);
    const logoutStore= useAuthStore((state) => state.logout);


    //Getting user data on app load

    const { data, isLoading,} = useQuery({  //OnSuccess and onError are removed in favor of useEffect to handle side effects based on query state
        queryKey: ['authUser'],
        queryFn: authApi.me,
        retry: false, // Don't retry on failure, as it likely means the user is not authenticated
     
    })

    //Syncing Zustand with React Query data

    useEffect(() => {
       if(data?.data?.user){
        setUser(data.data.user);
       }
       if (!isLoading && !data?.data?.user) {
        setUser(null);
      }
    },[data,isLoading,setUser])

    const user= data?.data?.user || null; // Extract user data or default to null if not available

    //2.Login

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setUser(data.data.user);
            queryClient.invalidateQueries({ queryKey: ['authUser'] }); // Refresh user data after login
        },
    });


    //2.SignUp

    const signUpMutation = useMutation({
        mutationFn: authApi.signUp,
        onSuccess: (data) => {
            setUser(data.data.user);
            queryClient.invalidateQueries({ queryKey: ['authUser'] }); // Refresh user data after signup
        },
    });

    //3.logout

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            logoutStore();
            queryClient.clear(); // Clear all queries to remove any user-specific data
        },
    });

    return{
        user,
        isLoading,
        login: loginMutation.mutateAsync,
        isAuthenticated: !!user,
        signUp: signUpMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        loginLoading: loginMutation.isPending,
        signUpLoading: signUpMutation.isPending,
        logoutLoading: logoutMutation.isPending,

    }


}