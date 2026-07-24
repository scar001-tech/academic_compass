import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";
import PendingApproval from "@/pages/PendingApproval";

export default function ProtectedRoute() {
  const { session, loading, isApproved } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">Loading…</div>;
  if (!session) return <Navigate to="/auth" replace/>;
  if (!isApproved) return <PendingApproval />;
  return <Outlet/>;
}
