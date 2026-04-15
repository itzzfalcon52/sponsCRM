import { useState } from "react";
import { useAuthStore } from "../../stores/authstore";
import { 
  Building2,
  Copy, 
  CheckCircle2, 
  LogOut,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const [copied, setCopied] = useState(false);
  const { user, logout } = useAuthStore() as any;

  const isAdmin = user?.role === "ADMIN";
  const inviteCode = (user?.organization as any)?.inviteCode;

  const handleCopyInvite = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      
      {/* Organization Badge (Replaces Search Bar) */}
      <div className="flex-1 max-w-md">
        {user?.organization?.name ? (
          <div className="flex items-center gap-2.5 text-slate-700 w-fit px-3 py-1.5 bg-slate-50/80 rounded-lg border border-slate-100">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-sm tracking-wide">
              {user.organization.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-sm italic">
            Connecting workspace...
          </div>
        )}
      </div>

      {/* Right Controls Section */}
      <div className="flex items-center gap-4 pl-4 shrink-0">
        
        {/* Invite Code Badge (Admin Only) */}
        {user?.organization && isAdmin && inviteCode && (
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full pl-3 pr-1 py-1">
            <span className="text-xs font-medium text-indigo-800">
              Invite Code: <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-indigo-200 shadow-sm">{inviteCode}</span>
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopyInvite}
              className="h-6 w-6 rounded-full hover:bg-indigo-200 text-indigo-700"
              title="Copy Invite Code"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end cursor-default">
            {user ? (
              <>
                <span className="text-sm font-semibold text-slate-700 leading-none">
                  {user.name || user.email?.split('@')[0] || "User"}
                </span>
                <span className="text-[10px] font-medium text-slate-500 mt-1 capitalize leading-none bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {user.role ? user.role.toLowerCase() : "member"}
                </span>
              </>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse"></div>
              </div>
            )}
          </div>
          
          <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 font-bold shadow-sm select-none overflow-hidden">
            {user ? (
              user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 ml-1 transition-colors rounded-full"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}