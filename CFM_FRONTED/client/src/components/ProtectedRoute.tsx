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
  const { user, isAuthenticated, loading, getRoleBasedRedirect, activeRole, isSubjectHead } = useAuth();

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

  // 🔐 Role-based access check
  if (allowedRoles) {
    // Check if the user's real role is allowed
    const realRoleAllowed = allowedRoles.includes(user.role);

    // Check if Teacher+SubjectHead can access Subject Head routes
    const isTeacherAccessingSubjectHead =
      user.role === "TEACHER" &&
      isSubjectHead &&
      allowedRoles.includes("SUBJECT_HEAD") &&
      activeRole === "SUBJECT_HEAD";

    // Check if HOD is accessing Teacher routes (they can act as teacher too)
    const isHodAccessingTeacher =
      user.role === "HOD" &&
      allowedRoles.includes("TEACHER") &&
      activeRole === "TEACHER";

    if (!realRoleAllowed && !isTeacherAccessingSubjectHead && !isHodAccessingTeacher) {
      const fallback = getRoleBasedRedirect(user.role);
      return <Navigate to={fallback} replace />;
    }
  }

  // ✅ Allowed
  return <>{children}</>;
}
