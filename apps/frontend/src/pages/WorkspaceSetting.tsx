import { useState } from "react";
import { useAuthStore } from "../stores/authstore";
import { useOrg } from "../hooks/useOrg";
import { 
  Building2, 
  Trash2, 
  LogOut, 
  Save, 
  AlertTriangle,
  Users,
  ShieldAlert,
  Info,
  ChevronRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WorkspaceSettings() {
  const { user } = useAuthStore();
  const { 
    orgMembers, 
    updateOrg, 
    leaveOrg, 
    deleteOrg, 
    isUpdatingOrg, 
    isLeavingOrg, 
    isDeletingOrg 
  } = useOrg();

  const [orgName, setOrgName] = useState(user?.organization?.name || "");
  const [isDeletingModal, setIsDeletingModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isSenior = role === "SENIOR";
  
  // Logic to prevent "Last Admin" from leaving
  const otherAdmins = orgMembers.filter((m:any) => m.role === "ADMIN" && m.id !== user?.id);

  const handleUpdate = () => {
    if (!orgName.trim()) return toast.error("Name cannot be empty");
    updateOrg({ name: orgName });
  };

  const handleLeave = () => {
    if (isAdmin && otherAdmins.length === 0) {
      return toast.error("You are the last Admin. Please appoint another Admin first.");
    }
    if (window.confirm("Are you sure you want to leave this workspace?")) {
      leaveOrg();
    }
  };

  const handleDelete = () => {
    if (confirmName !== orgName) {
      return toast.error("Organization name does not match.");
    }
    if (window.confirm("This action is irreversible. Are you absolutely sure?")) {
        deleteOrg();
      }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Workspace Settings
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage workspace identity, security, and membership status.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">
            Logged in as {role}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Left Column: Context Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-indigo-500" /> Role Permissions
                </h3>
                <ul className="space-y-3">
                    <li className={`text-xs flex items-center gap-2 ${isAdmin ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                        <ChevronRight className="h-3 w-3" /> Full System Access
                    </li>
                    <li className={`text-xs flex items-center gap-2 ${(isAdmin || isSenior) ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                        <ChevronRight className="h-3 w-3" /> Export & Advanced Search
                    </li>
                    <li className="text-xs flex items-center gap-2 text-indigo-600 font-bold">
                        <ChevronRight className="h-3 w-3" /> Basic CRM Operations
                    </li>
                </ul>
            </div>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* General Settings Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Identity</h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">Organization Display Name</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                disabled={!isAdmin}
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className={`flex-1 h-12 px-5 rounded-2xl border bg-slate-50 font-bold text-slate-700 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 
                                    ${!isAdmin ? 'cursor-not-allowed opacity-50' : 'focus:border-indigo-500 border-slate-200'}`}
                            />
                            {isAdmin && (
                                <Button 
                                    onClick={handleUpdate} 
                                    disabled={isUpdatingOrg}
                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    {isUpdatingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save
                                </Button>
                            )}
                        </div>
                        {!isAdmin && (
                            <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> You need Admin privileges to rename this workspace.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Leave Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                    <LogOut className="h-5 w-5 text-slate-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Membership</h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900">Leave Workspace</h3>
                        <p className="text-sm text-slate-500 font-medium">Exit this organization and clear your workspace session.</p>
                    </div>
                    <Button 
                        variant="outline"
                        disabled={isLeavingOrg}
                        onClick={handleLeave}
                        className="h-12 px-8 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                    >
                        {isLeavingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                        Leave
                    </Button>
                </div>
            </section>

            {/* Danger Zone (Admin Only) */}
            {isAdmin && (
                <section className="space-y-4 pt-6">
                    <div className="flex items-center gap-2 ml-1 text-rose-500">
                        <AlertTriangle className="h-5 w-5" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Danger Zone</h2>
                    </div>
                    <div className="bg-rose-50/30 border-2 border-dashed border-rose-200 rounded-[2rem] p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h3 className="font-bold text-rose-900">Delete this organization</h3>
                                <p className="text-xs text-rose-700/70 font-medium max-w-sm leading-relaxed">
                                    Once deleted, your pipeline data, activities, and member lists are gone forever. This cannot be undone.
                                </p>
                            </div>
                            {!isDeletingModal ? (
                                <Button 
                                    onClick={() => setIsDeletingModal(true)}
                                    className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl shadow-rose-200 transition-all active:scale-95"
                                >
                                    Delete Workspace
                                </Button>
                            ) : (
                                <div className="space-y-3 w-full md:w-auto">
                                    <input 
                                        placeholder={`Type "${user?.organization?.name}"`}
                                        value={confirmName}
                                        onChange={(e) => setConfirmName(e.target.value)}
                                        className="h-12 w-full md:w-64 px-4 rounded-xl border-2 border-rose-200 bg-white text-sm font-bold text-rose-900 outline-none focus:ring-4 focus:ring-rose-500/10"
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={handleDelete}
                                            disabled={isDeletingOrg}
                                            className="flex-1 bg-rose-600 text-white font-bold rounded-xl h-10 hover:bg-rose-700 shadow-lg"
                                        >
                                            {isDeletingOrg ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => { setIsDeletingModal(false); setConfirmName(""); }}
                                            className="px-4 text-slate-500 font-bold"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
      </div>
    </div>
  );
}