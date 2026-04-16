import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2, AlertCircle, Briefcase, Zap } from "lucide-react";
import { notifApi } from "../../api/notifApi"; // For DB notifications
import { api } from "../../api/axios"; // To hit the follow-ups endpoint
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NotificationTray() {
  const queryClient = useQueryClient();

  // 1. Fetch DB Notifications (Assignments/System)
  const { data: dbNotifs, isLoading: loadingNotifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: notifApi.getUnread,
    refetchInterval: 60000, // Refetch every minute
  });

  // 2. Fetch Calculated Alerts (Overdue Follow-ups)
  const { data: followUpData } = useQuery({
    queryKey: ["followup-alerts"],
    queryFn: () => api.get("/activities/follow-ups").then((res) => res.data),
  });

  const notifications = dbNotifs?.data || [];
  const overdueItems = followUpData?.overdue || [];
  const unreadCount = notifications.length + overdueItems.length;

  // Mutations
  const markAllRead = useMutation({
    mutationFn: notifApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications cleared");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-indigo-600 rounded-full h-9 w-9 transition-all active:scale-90">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 mt-2 p-0 border-slate-200/60 shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-500 fill-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Activity Feed</span>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllRead.mutate()}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
          {/* Section: Overdue Follow-ups (Calculated) */}
          {overdueItems.length > 0 && (
            <div className="bg-rose-50/30">
              {overdueItems.map((company: any) => (
                <DropdownMenuItem key={company.id} className="p-4 flex gap-3 focus:bg-rose-50 border-b border-rose-100/50 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Follow-up Overdue</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{company.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">Missed on {new Date(company.nextFollowUp).toLocaleDateString()}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {/* Section: Persistent Notifications (DB) */}
          {notifications.length > 0 ? (
            notifications.map((n: any) => (
              <DropdownMenuItem key={n.id} className="p-4 flex gap-3 focus:bg-indigo-50/50 border-b border-slate-100 last:border-0 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{n.title}</p>
                  <p className="text-sm font-medium text-slate-700 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : unreadCount === 0 ? (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 italic tracking-tight">You're all caught up!</p>
            </div>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}