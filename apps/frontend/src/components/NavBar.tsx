import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../stores/authstore";
import { useAuth } from "../hooks/useAuth";
import { 
  LogOut, 
  User as UserIcon, 
  Building, 
  LayoutDashboard,
  Settings 
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo View */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-indigo-600"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            SponsCRM
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="#about" className="hover:text-foreground transition-colors">About</Link>
        </nav>

        {/* Right Auth Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            // Logged Out State
            <>
              <Button variant="outline" asChild className="hidden md:inline-flex border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Link to="/organization">Create / Join Org</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          ) : (
            // Logged In State
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="hidden md:flex gap-2">
                <Link to="/organization">
                  <LayoutDashboard className="h-4 w-4" />
                  My Profile
                </Link>
              </Button>

              {user?.organization && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
                  <Link to="/organization">
                    <Building className="h-4 w-4" />
                    {user.organization.name}
                  </Link>
                </Button>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full pl-2 pr-4 pl-0 hover:bg-slate-100">
                    <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-full flex items-center justify-center h-8 w-8 ml-1">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium truncate max-w-[120px]">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.organization && (
                    <DropdownMenuItem asChild>
                      <Link to="/organization" className="cursor-pointer w-full flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Organization ({user.role})</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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