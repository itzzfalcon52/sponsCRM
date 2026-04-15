import { useState } from "react";
import { useOrg } from "../hooks/useOrg";
import { useAuthStore } from "../stores/authstore";
import { MoreVertical, Shield, UserX, UserMinus, ShieldAlert, Award } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Team() {
  const { orgMembers, isOrgMembersLoading, removeOrgMember, updateMemberRole } = useOrg();
  const currentUser = useAuthStore((s) => s.user);
  
  const isAdmin = currentUser?.role === "ADMIN";
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<any>(null);

  const handleRoleChange = (userId: string, newRole: string) => {
    updateMemberRole({ userId, role: newRole }, {
      onSuccess: () => toast.success(`User role updated to ${newRole}`),
      onError: (err: any) => toast.error(err.message || "Failed to update role")
    });
    setOpenDropdownId(null);
  };

  const handleRemove = () => {
    if (!removingUser) return;
    removeOrgMember(removingUser.id, {
      onSuccess: () => {
        toast.success("Member removed successfully");
        setRemovingUser(null);
      },
      onError: (err: any) => toast.error(err.message || "Failed to remove member")
    });
  };

  if (isOrgMembersLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading team members...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
        <p className="text-sm text-slate-500">
          Manage your organization's members, roles, and access.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Member</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Role</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Joined</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orgMembers.map((member: any) => {
              const isMe = member.id === currentUser?.id;
              
              return (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm
                        ${isAdmin ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                        {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {member.name || "Unnamed User"}
                          {isMe && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">You</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                      ${member.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 
                        member.role === 'SENIOR' ? 'bg-purple-100 text-purple-700' : 
                        'bg-slate-100 text-slate-700'}`}>
                      {member.role === 'ADMIN' && <Shield className="h-3.5 w-3.5" />}
                      {member.role === 'SENIOR' && <Award className="h-3.5 w-3.5" />}
                      {member.role === 'MEMBER' && <UserX className="h-3.5 w-3.5" />}
                      {member.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 text-right relative">
                    {isAdmin && !isMe && (
                      <>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === member.id ? null : member.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {openDropdownId === member.id && (
                          <div className="absolute right-10 top-12 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-[60] py-1.5 animate-in fade-in zoom-in-95 duration-100">
                            {member.role !== 'SENIOR' && (
                              <button 
                                onClick={() => handleRoleChange(member.id, 'SENIOR')}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Award className="h-4 w-4 text-slate-400" /> Make Senior
                              </button>
                            )}
                            {member.role !== 'MEMBER' && (
                              <button 
                                onClick={() => handleRoleChange(member.id, 'MEMBER')}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <UserX className="h-4 w-4 text-slate-400" /> Make Member
                              </button>
                            )}
                            {member.role !== 'ADMIN' && (
                              <button 
                                onClick={() => handleRoleChange(member.id, 'ADMIN')}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <ShieldAlert className="h-4 w-4 text-slate-400" /> Make Admin
                              </button>
                            )}
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                              onClick={() => {
                                setRemovingUser(member);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <UserMinus className="h-4 w-4" /> Remove Member
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Remove Confirmation Modal */}
      <Dialog open={!!removingUser} onOpenChange={(open) => !open && setRemovingUser(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-slate-900">{removingUser?.name || removingUser?.email}</span> from the organization? They will lose access to all pipeline data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRemovingUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>Remove Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}