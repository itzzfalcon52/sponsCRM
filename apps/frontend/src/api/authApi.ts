import { api } from "./axios";

export const authApi={
    //1.Login
    login: async (data:{email:string;password:string})=>{
        const res= await api.post("/auth/login",data)
        return res.data;
    },

    //2.Signup
    signUp: async (data:{email:string;password:string;name:string})=>{
        const res= await api.post("/auth/register",data);
        return res.data;
    },

    //3.Logout
    logout: async ()=>{
        const res= await api.post("/auth/logout");
        return res.data;
    },

    //get user data
    me: async ()=>{
        const res= await api.get("/auth/me");
        return res.data;
    }

}