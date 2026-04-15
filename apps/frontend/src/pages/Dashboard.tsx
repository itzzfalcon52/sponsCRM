// src/pages/Dashboard.tsx
import { useAuthStore } from "../stores/authstore";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import MemberDashboard from "../components/dashboard/MemberDashboard";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const isAdminOrSenior =
    user.role === "ADMIN" || user.role === "SENIOR";

  return isAdminOrSenior ? (
    <AdminDashboard />
  ) : (
    <MemberDashboard />
  );
}