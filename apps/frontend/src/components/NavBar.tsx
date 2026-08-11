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
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutStore = useAuthStore((state) => state.logout);
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(false);

  // ============================================================
  // THEME INITIALIZATION
  // ============================================================

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
      return;
    }

    if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      return;
    }

    // No saved preference → follow system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    document.documentElement.classList.toggle("dark", prefersDark);
    setIsDark(prefersDark);
  }, []);

  // ============================================================
  // THEME TOGGLE
  // ============================================================

  const toggleTheme = () => {
    const nextTheme = !isDark;

    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");

    setIsDark(nextTheme);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      // Wait for backend to clear HttpOnly cookie
      await logout();

      // Navigate to landing page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);

      // Even if backend logout fails,
      // clear local authentication state.
      logoutStore();

      navigate("/login", { replace: true });
    }
  };

  // ============================================================
  // ACTIVE NAVIGATION
  // ============================================================

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className="
        sticky
        top-0
        z-[100]
        w-full
        border-b
        border-border/60
        bg-background/80
        backdrop-blur-xl
        transition-colors
        duration-300
      "
    >
      <div
        className="
          container
          mx-auto
          flex
          h-16
          items-center
          justify-between
          px-6
          sm:px-12
        "
      >
        {/* ========================================================
            LEFT SIDE
        ======================================================== */}

        <div className="flex items-center gap-8">
          {/* ======================================================
              LOGO
          ====================================================== */}

          <Link
            to="/"
            className="
              group
              flex
              items-center
              gap-2
              text-2xl
              font-black
              tracking-tighter
              text-foreground
              transition-colors
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                rounded-lg
                bg-indigo-600
                p-1.5
                shadow-lg
                shadow-indigo-500/20
                transition-transform
                duration-300
                group-hover:rotate-6
              "
            >
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

          {/* ======================================================
              DESKTOP NAVIGATION
          ====================================================== */}

          <nav className="hidden items-center gap-1 md:flex">
            {/* Features */}

            <Link
              to="/features"
              className={`
                flex
                items-center
                gap-2
                rounded-full
                px-4
                py-2
                text-sm
                font-bold
                transition-all

                ${
                  isActive("/features")
                    ? `
                      bg-indigo-100
                      text-indigo-700
                      dark:bg-indigo-950/60
                      dark:text-indigo-300
                    `
                    : `
                      text-muted-foreground
                      hover:bg-muted
                      hover:text-foreground
                    `
                }
              `}
            >
              Features

              <span
                className="
                  flex
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-indigo-500
                  animate-pulse
                "
              />
            </Link>

            {/* Pricing */}

            <Link
              to="/pricing"
              className="
                rounded-full
                px-4
                py-2
                text-sm
                font-bold
                text-muted-foreground
                transition-all
                hover:bg-muted
                hover:text-foreground
              "
            >
              Pricing
            </Link>

            {/* About */}

            <Link
              to="/about"
              className="
                rounded-full
                px-4
                py-2
                text-sm
                font-bold
                text-muted-foreground
                transition-all
                hover:bg-muted
                hover:text-foreground
              "
            >
              About
            </Link>
          </nav>
        </div>

        {/* ========================================================
            RIGHT SIDE
        ======================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* ======================================================
              THEME TOGGLE
          ====================================================== */}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="
              h-9
              w-9
              rounded-full
              text-muted-foreground
              transition-all

              hover:bg-muted
              hover:text-foreground

              active:scale-90
            "
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* ======================================================
              AUTH SECTION
          ====================================================== */}

          {!isAuthenticated ? (
            <>
              {/* Login */}

              <Button
                variant="ghost"
                asChild
                className="
                  hidden
                  font-bold
                  text-muted-foreground
                  hover:bg-muted
                  hover:text-foreground
                  sm:inline-flex
                "
              >
                <Link to="/login">
                  Log in
                </Link>
              </Button>

              {/* Sign Up */}

              <Button
                asChild
                className="
                  rounded-xl
                  bg-foreground
                  px-5
                  font-bold
                  text-background
                  shadow-lg
                  transition-all

                  hover:-translate-y-0.5
                  hover:opacity-90

                  active:translate-y-0

                  sm:px-6
                "
              >
                <Link to="/register">
                  Sign up Free
                </Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* ==================================================
                  DASHBOARD BUTTON
              ================================================== */}

              <Button
                variant="outline"
                size="sm"
                asChild
                className="
                  hidden
                  gap-2
                  rounded-full
                  border-border
                  bg-background
                  font-bold
                  text-foreground
                  transition-all

                  hover:bg-muted

                  lg:flex
                "
              >
                <Link to="/dashboard">
                  <LayoutDashboard
                    className="
                      h-4
                      w-4
                      text-indigo-500
                      dark:text-indigo-400
                    "
                  />

                  Dashboard
                </Link>
              </Button>

              {/* ==================================================
                  USER DROPDOWN
              ================================================== */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="
                      relative
                      h-10
                      w-10
                      rounded-full
                      border-2
                      border-indigo-200
                      p-0
                      transition-all

                      hover:border-indigo-400

                      dark:border-indigo-900
                      dark:hover:border-indigo-600
                    "
                  >
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-indigo-500
                        to-purple-500
                        font-bold
                        text-white
                        shadow-md
                      "
                    >
                      {user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : user?.email
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="
                    mt-2
                    w-64
                    overflow-hidden
                    rounded-2xl
                    border-border
                    bg-popover
                    p-1
                    text-popover-foreground
                    shadow-2xl
                  "
                  align="end"
                >
                  {/* User Information */}

                  <DropdownMenuLabel
                    className="
                      p-4
                      font-normal
                    "
                  >
                    <div className="flex flex-col space-y-1">
                      <p
                        className="
                          text-sm
                          font-bold
                          leading-none
                          text-foreground
                        "
                      >
                        {user?.name || "Member"}
                      </p>

                      <p
                        className="
                          truncate
                          text-xs
                          leading-none
                          text-muted-foreground
                        "
                      >
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* My Account */}

                  <DropdownMenuItem
                    asChild
                    className="
                      cursor-pointer
                      rounded-xl
                      p-3
                      focus:bg-muted
                    "
                  >
                    <Link
                      to="/profile"
                      className="flex items-center"
                    >
                      <UserIcon
                        className="
                          mr-3
                          h-4
                          w-4
                          text-muted-foreground
                        "
                      />

                      <span className="font-bold">
                        My Account
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Organization */}

                  {user?.organization && (
                    <DropdownMenuItem
                      asChild
                      className="
                        cursor-pointer
                        rounded-xl
                        p-3
                        focus:bg-muted
                      "
                    >
                      <Link
                        to="/organization"
                        className="flex items-center"
                      >
                        <Building
                          className="
                            mr-3
                            h-4
                            w-4
                            text-indigo-500
                            dark:text-indigo-400
                          "
                        />

                        <span className="truncate font-bold">
                          Org:{" "}
                          {user.organization.name}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Workspace Settings */}

                  <DropdownMenuItem
                    asChild
                    className="
                      cursor-pointer
                      rounded-xl
                      p-3
                      focus:bg-muted
                    "
                  >
                    <Link
                      to="/settings"
                      className="flex items-center"
                    >
                      <Settings
                        className="
                          mr-3
                          h-4
                          w-4
                          text-muted-foreground
                        "
                      />

                      <span className="font-bold">
                        Workspace Settings
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sign Out */}

                  <DropdownMenuItem
                    className="
                      cursor-pointer
                      rounded-xl
                      p-3
                      font-bold
                      text-rose-600

                      focus:bg-rose-50
                      focus:text-rose-700

                      dark:text-rose-400
                      dark:focus:bg-rose-950/40
                      dark:focus:text-rose-300
                    "
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