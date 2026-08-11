import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "../stores/authstore";

export default function Login() {
  const { login,  isLoggingIn} = useAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoggingIn) return;

    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully!", {
            description: "Redirecting you to your Organization...",
          });
          navigate("/organization");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            "Login failed. Please check your credentials.";
          toast.error("Login Failed", {
            description: message,
          });
        },
      }
    );
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <User className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              You're already signed in
            </h1>
            <p className="text-muted-foreground">
              You have an active session. There's no need to log in again.
            </p>
          </div>
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={() => navigate("/organization")}
          >
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="relative hidden flex-col items-center justify-between bg-zinc-900 p-10 text-white lg:flex dark">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556742212-5b321f3c261b?q=80&w=2940&auto=format&fit=crop')",
            opacity: 0.1,
          }}
        />
        <div className="z-10 self-start">
          <a href="/" className="flex items-center gap-2 text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            SponsCRM
          </a>
        </div>
        <div className="z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back to SponsCRM.
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Log in to manage your sponsorships, track your pipeline, and close deals faster.
          </p>
        </div>
        <div className="z-10 self-start">
          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} SponsCRM Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoggingIn} className="w-full">
              {isLoggingIn? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 font-semibold"
              onClick={() => navigate("/register")}
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}