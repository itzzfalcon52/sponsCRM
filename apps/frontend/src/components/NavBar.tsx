import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../stores/authstore";
import { useAuth } from "../hooks/useAuth";
import { 
  LogOut, 
  User as UserIcon, 
  Building, 
  LayoutDashboard,
  Settings,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NavBar() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 sm:px-12">
        {/* Logo View */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-indigo-200">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
            </div>
            SponsCRM
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/features" 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                isActive('/features') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Features
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </Link>
            <Link to="/pricing" className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">Pricing</Link>
            <Link to="/about" className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">About</Link>
          </nav>
        </div>

        {/* Right Auth Section */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex font-bold text-slate-600">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6 shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
                <Link to="/register">Sign up Free</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild className="hidden lg:flex gap-2 rounded-full border-slate-200 font-bold text-slate-700 hover:bg-slate-50">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                  Dashboard
                </Link>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center h-full w-full font-bold shadow-md">
                      {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2" align="end">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-slate-900">{user?.name || "Member"}</p>
                      <p className="text-xs leading-none text-slate-500 italic">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="p-3 cursor-pointer">
                    <Link to="/profile">
                      <UserIcon className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="font-bold">My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.organization && (
                    <DropdownMenuItem asChild className="p-3 cursor-pointer">
                      <Link to="/organization">
                        <Building className="mr-3 h-4 w-4 text-indigo-400" />
                        <span className="font-bold">Org: {user.organization.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <Settings className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="font-bold">Workspace Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="p-3 cursor-pointer text-red-600 focus:bg-red-50 font-bold" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}