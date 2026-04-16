
import { Navigate, Outlet } from "react-router-dom"; 
import { useAuthStore } from "../stores/authstore";

export default function ProtectedRoute({ children }: any) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  //  If children exist, render them. If not, render the Outlet.
  return children ? children : <Outlet />;
}