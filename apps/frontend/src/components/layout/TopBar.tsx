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
  Bell,
  ChevronDown
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

export default function Topbar() {
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";
  const inviteCode = user?.organization?.inviteCode;

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
    <header className="h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-[49]">
      
      {/* Left: Organization Context */}
      <div className="flex items-center gap-4">
        {user?.organization?.name ? (
          <div className="group flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl transition-all hover:bg-white hover:shadow-sm">
            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Workspace</span>
              <span className="font-bold text-sm text-slate-700 leading-none">
                {user.organization.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Initialising...</span>
          </div>
        )}
      </div>

      {/* Right Controls Section */}
      <div className="flex items-center gap-3">
        
        {/* Invite Code (Admin Only) */}
        {user?.organization && isAdmin && inviteCode && (
          <div className="hidden lg:flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-4 pr-1.5 py-1 shadow-sm hover:border-indigo-200 transition-colors group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invite:</span>
            <span className="font-mono text-xs font-bold text-indigo-600">{inviteCode}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyInvite}
              className="h-7 w-7 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}

        <div className="h-8 w-px bg-slate-200/60 mx-2"></div>

        {/* Action Icons */}
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 rounded-full h-9 w-9">
            <Bell className="h-5 w-5" />
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all focus:outline-none group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64 mt-2" align="end">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{user?.name || "Member"}</p>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                        {user?.role || "Member"}
                    </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 cursor-pointer text-slate-600 font-medium">
              <Link to="/profile" className="flex items-center">
                <UserIcon className="mr-3 h-4 w-4 text-slate-400" /> Account Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Standalone Logout Button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 ml-1 transition-colors rounded-full"
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