import { api } from "./axios";


export const orgApi={
    //1.Create org
    createOrg: async (data:{name:string})=>{
        const res= await api.post("/org/create",data)
        return res.data;
    },

    //2,Join org
    joinOrg: async (data:{inviteCode:string})=>{
        const res= await api.post("/org/join",data);
        return res.data;
    },

    //3.Get org members
    getOrgMembers: async ()=>{
        const res= await api.get("/org/members");
        return res.data;

    },

    //4.Remove org member
    removeOrgMember: async (memberId:string)=>{
        const res= await api.delete(`/org/members/${memberId}`);
        return res.data;
    },

    //5.Update member role 
    updateMemberRole: async ({ userId, role }: { userId: string; role: string }) => {
        const res = await api.patch(`/org/members/${userId}/role`, { role });
        return res.data;
    },

    // 6. Update Org Name (Admin Only)
    updateOrg: async (data: { name: string }) => {
        const res = await api.patch("/org/update", data);
        return res.data;
    },

    // 7. Leave Organization
    leaveOrg: async () => {
        const res = await api.post("/org/leave");
        return res.data;
    },

    // 8. Delete Organization (Admin Only)
    deleteOrg: async () => {
        const res = await api.delete("/org/delete");
        return res.data;
    }


}