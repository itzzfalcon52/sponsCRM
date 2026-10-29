import { useNavigate } from "react-router-dom";
import { Building2, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrg } from "../../hooks/useOrg";
import { useAuthStore } from "../../stores/authstore";

const initial = (name: string) => name.charAt(0).toUpperCase();

/**
 * The organization badge: it opens a menu to switch between the organizations
 * you belong to, or to join or create another. `sidebar` is the badge at the
 * top of the sidebar; `topbar` is the "Workspace" chip in the top bar. Only
 * the trigger differs, the menu is shared.
 */
export default function OrgSwitcher({
  onNavigate,
  variant = "sidebar",
}: {
  onNavigate?: () => void;
  variant?: "sidebar" | "topbar";
}) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { switchOrg, isSwitchingOrg } = useOrg();

  const active = user?.organization;
  if (!user || !active) return null;

  const organizations = user.organizations ?? [];

  const handleSwitch = (orgId: string) => {
    if (orgId === active.id || isSwitchingOrg) return;

    switchOrg(orgId, {
      onSuccess: () => {
        onNavigate?.();
        navigate("/dashboard", { replace: true });
      },
    });
  };

  const handleAdd = () => {
    onNavigate?.();
    navigate("/organization?mode=add");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "topbar" ? (
          <button
            type="button"
            aria-label="Switch organization"
            className="group flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-card px-2 py-1.5 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:border-indigo-800 sm:gap-3 sm:px-3"
          >
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:rotate-3 sm:flex">
              <Building2 className="h-4 w-4 text-white" />
            </div>

            <div className="flex min-w-0 flex-col">
              <span className="mb-1 hidden text-[9px] font-black uppercase leading-none tracking-widest text-indigo-500 dark:text-indigo-400 sm:block">
                Workspace
              </span>
              <span className="max-w-[110px] truncate text-sm font-bold leading-none text-foreground sm:max-w-[220px]">
                {active.name}
              </span>
            </div>

            {isSwitchingOrg ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Switch organization"
            className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 font-bold text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400">
              {isSwitchingOrg ? <Loader2 className="h-4 w-4 animate-spin" /> : initial(active.name)}
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                {active.name}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {user.role}
              </span>
            </div>

            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-64">
        <DropdownMenuLabel>Your organizations</DropdownMenuLabel>

        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => handleSwitch(org.id)}
            className="gap-3 py-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
              {initial(org.name)}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{org.name}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {org.role}
              </span>
            </div>

            {org.id === active.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleAdd} className="gap-3 py-2">
          <Plus className="h-4 w-4" />
          Join or create an organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
