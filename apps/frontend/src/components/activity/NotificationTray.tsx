import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  AlertCircle,
  Briefcase,
  Zap,
} from "lucide-react";
import { notifApi } from "../../api/notifApi";
import { api } from "../../api/axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NotificationTray() {
  const queryClient = useQueryClient();

  // ============================================================
  // DATABASE NOTIFICATIONS
  // ============================================================

  const { data: dbNotifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: notifApi.getUnread,
    refetchInterval: 60000,
  });

  // ============================================================
  // FOLLOW-UP ALERTS
  // ============================================================

  const { data: followUpData } = useQuery({
    queryKey: ["followup-alerts"],
    queryFn: () =>
      api
        .get("/activities/follow-ups")
        .then((res) => res.data),
  });

  const notifications = dbNotifs?.data || [];
  const overdueItems = followUpData?.overdue || [];

  const unreadCount =
    notifications.length + overdueItems.length;

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllRead = useMutation({
    mutationFn: notifApi.markAllRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      toast.success("All notifications cleared");
    },

    onError: () => {
      toast.error("Failed to clear notifications");
    },
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DropdownMenu>
      {/* ========================================================
          TRIGGER
      ======================================================== */}

      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="
            relative
            h-9
            w-9
            rounded-full
            text-muted-foreground

            transition-all
            duration-200

            hover:bg-muted
            hover:text-indigo-600

            dark:hover:text-indigo-400

            active:scale-90
          "
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                flex
                h-4
                min-w-4
                items-center
                justify-center
                rounded-full
                border-2
                border-background
                bg-rose-500
                px-0.5
                text-[9px]
                font-black
                leading-none
                text-white
                shadow-sm

                animate-in
                zoom-in
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* ========================================================
          NOTIFICATION PANEL
      ======================================================== */}

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="
          w-80
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-background
          p-0
          text-foreground
          shadow-2xl
        "
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            bg-muted/40
            px-4
            py-4
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-indigo-100
                dark:bg-indigo-950/50
              "
            >
              <Zap
                className="
                  h-3.5
                  w-3.5
                  fill-indigo-500
                  text-indigo-500
                  dark:text-indigo-400
                "
              />
            </div>

            <span
              className="
                text-xs
                font-black
                uppercase
                tracking-widest
                text-muted-foreground
              "
            >
              Activity Feed
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
              className="
                text-[10px]
                font-bold
                text-indigo-600
                transition-colors

                hover:text-indigo-700

                dark:text-indigo-400
                dark:hover:text-indigo-300

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {markAllRead.isPending
                ? "Clearing..."
                : "Mark all as read"}
            </button>
          )}
        </div>

        {/* ======================================================
            NOTIFICATION LIST
        ====================================================== */}

        <div className="max-h-[380px] overflow-y-auto">
          {/* ====================================================
              OVERDUE FOLLOW-UPS
          ==================================================== */}

          {overdueItems.length > 0 && (
            <div
              className="
                border-b
                border-rose-200/50
                bg-rose-50/40

                dark:border-rose-900/40
                dark:bg-rose-950/20
              "
            >
              {overdueItems.map((company: any) => (
                <DropdownMenuItem
                  key={`overdue-${company.id}`}
                  className="
                    flex
                    cursor-pointer
                    gap-3
                    border-b
                    border-rose-200/40
                    p-4
                    last:border-0

                    focus:bg-rose-100/60

                    dark:border-rose-900/30
                    dark:focus:bg-rose-950/40
                  "
                >
                  {/* Icon */}

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-rose-200
                      bg-rose-100
                      dark:border-rose-900/60
                      dark:bg-rose-950/50
                    "
                  >
                    <AlertCircle
                      className="
                        h-4
                        w-4
                        text-rose-600
                        dark:text-rose-400
                      "
                    />
                  </div>

                  {/* Content */}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-tighter
                        text-rose-600
                        dark:text-rose-400
                      "
                    >
                      Follow-up Overdue
                    </p>

                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        leading-tight
                        text-foreground
                      "
                    >
                      {company.name}
                    </p>

                    <p
                      className="
                        text-[10px]
                        font-medium
                        italic
                        text-muted-foreground
                      "
                    >
                      Missed on{" "}
                      {new Date(
                        company.nextFollowUp
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {/* ====================================================
              DATABASE NOTIFICATIONS
          ==================================================== */}

          {notifications.length > 0 &&
            notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className="
                  flex
                  cursor-pointer
                  gap-3
                  border-b
                  border-border
                  p-4
                  last:border-0

                  focus:bg-indigo-50/60

                  dark:focus:bg-indigo-950/30
                "
              >
                {/* Icon */}

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-indigo-200
                    bg-indigo-50

                    dark:border-indigo-900/60
                    dark:bg-indigo-950/40
                  "
                >
                  <Briefcase
                    className="
                      h-4
                      w-4
                      text-indigo-600
                      dark:text-indigo-400
                    "
                  />
                </div>

                {/* Content */}

                <div className="flex min-w-0 flex-col gap-0.5">
                  <p
                    className="
                      truncate
                      text-[10px]
                      font-black
                      uppercase
                      tracking-tighter
                      text-indigo-600

                      dark:text-indigo-400
                    "
                  >
                    {notification.title}
                  </p>

                  <p
                    className="
                      text-sm
                      font-medium
                      leading-snug
                      text-foreground
                    "
                  >
                    {notification.message}
                  </p>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      text-muted-foreground
                    "
                  >
                    {formatDistanceToNow(
                      new Date(notification.createdAt),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}

          {/* ====================================================
              EMPTY STATE
          ==================================================== */}

          {unreadCount === 0 && (
            <div
              className="
                flex
                flex-col
                items-center
                gap-2
                p-10
                text-center
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  bg-muted
                  text-muted-foreground/50
                "
              >
                <Check className="h-6 w-6" />
              </div>

              <p
                className="
                  text-xs
                  font-bold
                  italic
                  tracking-tight
                  text-muted-foreground
                "
              >
                You're all caught up!
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}