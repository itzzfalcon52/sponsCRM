import { useState } from "react";
import { useAuthStore } from "../stores/authstore";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  BadgeCheck, 
  Calendar,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Local state for the form
  const [name, setName] = useState(user?.name || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 ring-4 ring-white">
              {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name || "User Profile"}</h1>
              <BadgeCheck className="h-5 w-5 text-indigo-500 fill-indigo-50" />
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Member since 2026</span>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Sidebar Context */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
                <Shield className="h-8 w-8 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Account Security</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                    Your account is currently protected with a secure session cookie. Manage your password and session settings here.
                </p>
                <Button variant="secondary" className="w-full font-bold rounded-xl text-indigo-600 hover:bg-white">
                    Reset Password
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Your Role</h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{user?.role || "Member"}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Permissions</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Personal Details
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <Input 
                                disabled
                                value={user?.email}
                                className="h-12 bg-slate-100 border-slate-200 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium max-w-[250px]">
                        Last profile update was less than 24 hours ago.
                    </p>
                    <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Update Profile
                    </Button>
                </div>
            </form>

            <div className="bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-[2rem] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="font-bold text-rose-900">Close Account</h3>
                        <p className="text-xs text-rose-700 font-medium max-w-sm">
                            Permanently delete your personal account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                    <Button variant="ghost" className="text-rose-600 font-black hover:bg-rose-100 hover:text-rose-700 rounded-xl">
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}