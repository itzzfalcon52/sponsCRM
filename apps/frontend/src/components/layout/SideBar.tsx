import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authstore";
import {
  LayoutDashboard,
  Building2,
  Layers,
  Activity,
  Users,
  Building,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Companies",
      path: "/companies",
      icon: Building2,
    },
    {
      name: "Pipeline",
      path: "/pipeline",
      icon: Layers,
    },
    {
      name: "Activities",
      path: "/activities",
      icon: Activity,
    },
  ];

  if (isAdminOrSenior) {
    navItems.push({
      name: "Team",
      path: "/team",
      icon: Users,
    });
  }

  return (
    <div className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-sm">

      {/* =====================================================
          BRAND HEADER
      ===================================================== */}

      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-sidebar-foreground transition-opacity hover:opacity-80"
        >
          {/* Logo */}

          <div className="flex items-center justify-center rounded-lg bg-indigo-600 p-1.5 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>

          SponsCRM
        </Link>
      </div>

      {/* =====================================================
          ORGANIZATION BADGE
      ===================================================== */}

      {user?.organization && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 transition-colors">

            {/* Organization Initial */}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 font-bold text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400">
              {user.organization.name
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* Organization Info */}

            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                {user.organization.name}
              </span>

              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="flex-1 overflow-y-auto px-4 py-2">

        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </div>

        <nav className="flex flex-col gap-1">

          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group flex items-center gap-3 rounded-lg
                  px-3 py-2.5
                  text-sm font-medium
                  transition-all duration-200

                  ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }
                `}
              >
                <Icon
                  className={`
                    h-4 w-4 shrink-0 transition-colors duration-200

                    ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    }
                  `}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}

        </nav>
      </div>

      {/* =====================================================
          BOTTOM ACTIONS
      ===================================================== */}

      <div className="border-t border-sidebar-border p-4">

        <Link
          to="/settings"
          className={`
            group flex items-center gap-3
            rounded-lg
            px-3 py-2.5
            text-sm font-medium
            transition-all duration-200

            ${
              location.pathname === "/settings"
                ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-400"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }
          `}
        >
          <Building
            className={`
              h-4 w-4 shrink-0 transition-colors duration-200

              ${
                location.pathname === "/settings"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground group-hover:text-sidebar-foreground"
              }
            `}
          />

          <span>Workspace Settings</span>
        </Link>

      </div>
    </div>
  );
}