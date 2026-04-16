import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authstore";
import { Loader2 } from "lucide-react";

export default function OrgRequiredRoute() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // 1. Wait for the /auth/me call to finish
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // 2. If not logged in at all, the parent ProtectedRoute usually handles this,
  // but we add a safety check here.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists but has no organization, 
  // send them to the setup page.
  if (!user?.organization) {
    return <Navigate to="/organization" replace />;
  }

  // 4. If they have an org, let them through to the children routes
  return <Outlet />;
}