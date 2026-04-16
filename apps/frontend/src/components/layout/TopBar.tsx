import { useState } from "react";
import { useAuthStore } from "../../stores/authstore";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios"; 
import { 
  Building2,
  Copy, 
  CheckCircle2, 
  LogOut,
  User as UserIcon,
  Loader2,
  ChevronDown,
  Bell,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationTray from "../activity/NotificationTray";

export default function Topbar() {
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";
  const inviteCode = user?.organization?.inviteCode;

  // PRESERVED LOGOUT LOGIC
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout"); 
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      logout();
      navigate("/", { replace: true });
      setIsLoggingOut(false);
    }
  };

  const handleCopyInvite = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="h-16 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-[49]">
      
      {/* Left: Organization Context */}
      <div className="flex items-center gap-4">
        {user?.organization?.name ? (
          <div className="group flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-2xl transition-all hover:border-indigo-200 hover:shadow-sm">
            <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-3 transition-transform">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Workspace</span>
              <span className="font-bold text-sm text-slate-800 leading-none">
                {user.organization.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing...</span>
          </div>
        )}
      </div>

      {/* Right Controls Section */}
      <div className="flex items-center gap-3">
        
        {/* Invite Code - Pill Design */}
        {user?.organization && isAdmin && inviteCode && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-4 pr-1 py-1 shadow-inner group transition-colors hover:bg-white hover:border-indigo-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invite:</span>
            <span className="font-mono text-xs font-bold text-slate-600">{inviteCode}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyInvite}
              className="h-7 w-7 rounded-full hover:bg-white text-slate-400 hover:text-indigo-600"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200/60 mx-1"></div>

        {/* Action Logic Component */}
        <NotificationTray />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-all focus:outline-none group">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:flex flex-col items-start mr-1">
                <span className="text-xs font-bold text-slate-900 leading-none">{user?.name?.split(' ')[0]}</span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Pro</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64 mt-2 p-0 border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden" align="end">
            <DropdownMenuLabel className="font-normal p-4 bg-slate-50/50">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{user?.name || "Member"}</p>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-indigo-600 text-white rounded-md">
                        {user?.role}
                    </span>
                </div>
                <p className="text-xs text-slate-400 truncate font-medium">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-1.5">
              <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-xl focus:bg-indigo-50 group">
                <Link to="/profile" className="flex items-center w-full">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
                    <UserIcon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Account Settings</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Standalone Logout Button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-1 transition-all rounded-full active:scale-90"
          title="Sign Out"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}