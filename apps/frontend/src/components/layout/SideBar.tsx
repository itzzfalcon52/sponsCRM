import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authstore";
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  Activity, 
  Users, 
  Building 
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const isAdminOrSenior =
    user?.role === "ADMIN" || user?.role === "SENIOR";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Companies", path: "/companies", icon: Building2 },
    { name: "Pipeline", path: "/pipeline", icon: Layers },
    { name: "Activities", path: "/activities", icon: Activity },
  ];

  if (isAdminOrSenior) {
    navItems.push({ name: "Team", path: "/team", icon: Users });
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
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

      {/* Organization Badge (Optional but good for SaaS) */}
      {user?.organization && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <div className="h-8 w-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-sm">
              {user.organization.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {user.organization.name}
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100">
        <Link
          to="/organization"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            location.pathname === "/organization"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Building className={`h-4 w-4 ${location.pathname === "/organization" ? "text-indigo-600" : "text-slate-400"}`} />
          Workspace Settings
        </Link>
      </div>
    </div>
  );
}