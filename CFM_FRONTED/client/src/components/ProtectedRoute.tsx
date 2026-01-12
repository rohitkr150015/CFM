import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, getRoleBasedRedirect } = useAuth();

  // 🔄 While auth state is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  // ❌ Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // 🔐 Role-based access check (REAL ROLE)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = getRoleBasedRedirect(user.role);
    return <Navigate to={fallback} replace />;
  }

  // ✅ Allowed
  return <>{children}</>;
}
