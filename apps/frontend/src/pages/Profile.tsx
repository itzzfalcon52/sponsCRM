import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  BadgeCheck, 
  Calendar,
  Save,
  Loader2,
  Lock,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    deleteAccount,
    isUpdatingProfile,
    isChangingPassword,
    isDeletingAccount 
  } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || "");

  // Password UI Toggle & State
  const [showPassFields, setShowPassFields] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "" });

  // Delete Account Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState("");

  /** --- Handlers --- **/

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    await updateProfile({ name });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new.length < 6) return toast.error("New password must be at least 6 characters");
    
    await changePassword({ 
      currentPassword: passwords.current, 
      newPassword: passwords.new 
    });
    
    // Reset state on success
    setPasswords({ current: "", new: "" });
    setShowPassFields(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    await deleteAccount();
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 ring-4 ring-white transition-transform group-hover:scale-105">
              {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 transition-all hover:scale-110">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name || "User Profile"}</h1>
              <BadgeCheck className="h-5 w-5 text-indigo-500 fill-indigo-50" />
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
        </div>
        
        <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Member since 2026</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Password Security Card */}
            <div className={`rounded-[2rem] p-8 transition-all duration-500 ${showPassFields ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-indigo-600 text-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <Shield className="h-8 w-8 opacity-80" />
                  {showPassFields && <Lock className="h-5 w-5 text-indigo-400 animate-pulse" />}
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Account Security</h3>
                <p className={`text-sm leading-relaxed mb-6 ${showPassFields ? 'text-slate-400 font-medium' : 'text-indigo-100'}`}>
                    {showPassFields 
                        ? "Enter your current and new password to update your credentials." 
                        : "Manage your credentials and keep your account protected."}
                </p>
                
                {!showPassFields ? (
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowPassFields(true)}
                    className="w-full font-bold rounded-xl text-indigo-600 hover:bg-white transition-all active:scale-95"
                  >
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Current Password</Label>
                      <Input 
                        type="password" 
                        required
                        className="bg-slate-800 border-slate-700 text-white rounded-xl h-10"
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">New Password</Label>
                      <Input 
                        type="password" 
                        required
                        className="bg-slate-800 border-slate-700 text-white rounded-xl h-10"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        disabled={isChangingPassword}
                        className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl h-11"
                      >
                        {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Update"}
                      </Button>
                      <button 
                        type="button"
                        onClick={() => setShowPassFields(false)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
            </div>

            {/* Role Badge Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Account Status</h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <UserIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{user?.role || "Member"}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Global Permissions</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-slate-400" /> Personal Details
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 transition-all focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <Input 
                                disabled
                                value={user?.email}
                                className="h-12 bg-slate-100 border-slate-200 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium max-w-[250px] leading-relaxed">
                        Your public name is visible to all members within your organization.
                    </p>
                    <Button 
                        type="submit" 
                        disabled={isUpdatingProfile}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="bg-rose-50/40 border-2 border-dashed border-rose-200 rounded-[2rem] p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="font-bold text-rose-900 flex items-center gap-2 uppercase tracking-tight">
                          <AlertCircle className="h-4 w-4" /> Danger Zone
                        </h3>
                        <p className="text-xs text-rose-700/70 font-medium max-w-sm leading-relaxed">
                            Deleting your account is permanent. This will scrub all your associated pipeline history and activities.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest ml-1">Type "DELETE" to confirm</p>
                        <Input 
                          placeholder="DELETE"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="h-10 bg-white border-rose-200 text-rose-900 font-black text-center placeholder:text-rose-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300"
                        />
                      </div>
                      <Button 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirm !== "DELETE" || isDeletingAccount}
                        className={`h-12 px-8 font-black rounded-2xl transition-all active:scale-95 ${
                          deleteConfirm === "DELETE" 
                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-200' 
                          : 'bg-rose-100 text-rose-300 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminate Account"}
                      </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}