import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";
import PendingApproval from "@/pages/PendingApproval";
import Loading from "@/components/Loading";

export default function ProtectedRoute() {
  const { session, loading, isApproved } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isApproved) return <PendingApproval />;
  return <Outlet />;
}
