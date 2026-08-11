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
  Sun,
  Moon,
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

  // ============================================================
  // THEME
  // ============================================================

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    const root = document.documentElement;

    root.classList.toggle("dark");

    const dark = root.classList.contains("dark");

    setIsDark(dark);

    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

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

  // ============================================================
  // COPY INVITE CODE
  // ============================================================

  const handleCopyInvite = () => {
    if (!inviteCode) return;

    navigator.clipboard.writeText(inviteCode);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <header
      className="
        sticky top-0 z-[49]
        flex h-16 w-full
        items-center justify-between
        border-b border-border
        bg-background/80
        px-8
        backdrop-blur-xl
        transition-colors
      "
    >
      {/* ========================================================
          LEFT — ORGANIZATION
      ======================================================== */}

      <div className="flex items-center gap-4">
        {user?.organization?.name ? (
          <div
            className="
              group flex items-center gap-3
              rounded-2xl
              border border-border
              bg-card
              px-3 py-1.5
              shadow-sm
              transition-all
              hover:border-indigo-300
              hover:shadow-md
              dark:hover:border-indigo-800
            "
          >
            {/* Organization Icon */}

            <div
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-xl
                bg-indigo-600
                shadow-lg shadow-indigo-500/20
                transition-transform
                group-hover:rotate-3
              "
            >
              <Building2 className="h-4 w-4 text-white" />
            </div>

            {/* Organization Name */}

            <div className="flex flex-col">
              <span
                className="
                  mb-1 text-[9px]
                  font-black uppercase
                  tracking-widest
                  leading-none
                  text-indigo-500
                  dark:text-indigo-400
                "
              >
                Workspace
              </span>

              <span
                className="
                  max-w-[220px]
                  truncate
                  text-sm
                  font-bold
                  leading-none
                  text-foreground
                "
              >
                {user.organization.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />

            <span className="animate-pulse text-[10px] font-black uppercase tracking-widest">
              Initializing...
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          RIGHT CONTROLS
      ======================================================== */}

      <div className="flex items-center gap-2">
        {/* ======================================================
            INVITE CODE
        ====================================================== */}

        {user?.organization && isAdmin && inviteCode && (
          <div
            className="
              hidden items-center gap-2
              rounded-full
              border border-border
              bg-muted/50
              pl-4 pr-1 py-1
              shadow-inner
              transition-colors
              hover:bg-card
              hover:border-indigo-200
              dark:hover:border-indigo-900
              lg:flex
            "
          >
            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-widest
                text-muted-foreground
              "
            >
              Invite:
            </span>

            <span
              className="
                font-mono
                text-xs
                font-bold
                text-foreground
              "
            >
              {inviteCode}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyInvite}
              className="
                h-7 w-7
                rounded-full
                text-muted-foreground
                hover:bg-background
                hover:text-indigo-600
                dark:hover:text-indigo-400
              "
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}

        {/* Divider */}

        <div className="mx-1 h-6 w-px bg-border" />

        {/* ======================================================
            THEME TOGGLE
        ====================================================== */}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="
            relative
            h-9 w-9
            rounded-full
            border border-transparent
            text-muted-foreground
            transition-all
            hover:border-border
            hover:bg-muted
            hover:text-foreground
            active:scale-90
          "
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-300" />
          )}
        </Button>

        {/* ======================================================
            NOTIFICATIONS
        ====================================================== */}

        <NotificationTray />

        {/* ======================================================
            USER DROPDOWN
        ====================================================== */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="
                group flex items-center gap-2.5
                rounded-full
                p-1
                outline-none
                transition-all
                hover:bg-muted
              "
            >
              {/* Avatar */}

              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-slate-800
                  to-slate-950
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-slate-500/10
                  transition-transform
                  group-hover:scale-105
                  dark:from-slate-600
                  dark:to-slate-900
                "
              >
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </div>

              {/* Name */}

              <div className="mr-1 hidden flex-col items-start sm:flex">
                <span
                  className="
                    text-xs
                    font-bold
                    leading-none
                    text-foreground
                  "
                >
                  {user?.name?.split(" ")[0] || "User"}
                </span>

                <span
                  className="
                    mt-1
                    text-[9px]
                    font-black
                    uppercase
                    tracking-tighter
                    text-indigo-500
                    dark:text-indigo-400
                  "
                >
                  {user?.role || "Member"}
                </span>
              </div>

              <ChevronDown
                className="
                  h-3.5 w-3.5
                  text-muted-foreground
                  transition-colors
                  group-hover:text-foreground
                "
              />
            </button>
          </DropdownMenuTrigger>

          {/* ====================================================
              DROPDOWN
          ==================================================== */}

          <DropdownMenuContent
            align="end"
            className="
              mt-2
              w-64
              overflow-hidden
              rounded-2xl
              border-border
              bg-popover
              p-0
              shadow-2xl
            "
          >
            {/* User Information */}

            <DropdownMenuLabel
              className="
                bg-muted/40
                p-4
                font-normal
              "
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="
                      truncate
                      text-sm
                      font-bold
                      text-popover-foreground
                    "
                  >
                    {user?.name || "Member"}
                  </p>

                  <span
                    className="
                      shrink-0
                      rounded-md
                      bg-indigo-600
                      px-1.5 py-0.5
                      text-[8px]
                      font-black
                      uppercase
                      text-white
                    "
                  >
                    {user?.role}
                  </span>
                </div>

                <p
                  className="
                    truncate
                    text-xs
                    font-medium
                    text-muted-foreground
                  "
                >
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="m-0 bg-border" />

            {/* Account */}

            <div className="p-1.5">
              <DropdownMenuItem
                asChild
                className="
                  cursor-pointer
                  rounded-xl
                  p-2.5
                  focus:bg-accent
                "
              >
                <Link
                  to="/profile"
                  className="flex w-full items-center"
                >
                  <div
                    className="
                      mr-3
                      flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      bg-muted
                      transition-colors
                      group-hover:bg-background
                    "
                  >
                    <UserIcon
                      className="
                        h-4 w-4
                        text-muted-foreground
                        group-hover:text-indigo-600
                        dark:group-hover:text-indigo-400
                      "
                    />
                  </div>

                  <span
                    className="
                      text-sm
                      font-bold
                      text-muted-foreground
                    "
                  >
                    Account Settings
                  </span>
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ======================================================
            LOGOUT
        ====================================================== */}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="
            ml-1
            h-9 w-9
            rounded-full
            text-muted-foreground
            transition-all
            hover:bg-rose-50
            hover:text-rose-600
            active:scale-90
            dark:hover:bg-rose-950/40
            dark:hover:text-rose-400
          "
          title="Sign Out"
          aria-label="Sign Out"
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