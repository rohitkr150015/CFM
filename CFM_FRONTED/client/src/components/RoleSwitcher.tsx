import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Shield, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/contexts/AuthContext";

export function RoleSwitcher() {
  const { user, activeRole, switchRole } = useAuth();
  const navigate = useNavigate();

  // 🔐 Normal teacher ko role switch dikhana hi nahi
  if (!user || user.role !== "HOD") {
    return null;
  }

  const roles: UserRole[] = ["HOD", "TEACHER"];

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);

    if (role === "HOD") {
      navigate("/hod/dashboard");
    } else {
      navigate("/teacher/dashboard");
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "HOD":
        return <Shield className="h-4 w-4" />;
      case "SUBJECT_HEAD":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "HOD":
        return "HOD Dashboard";
      case "TEACHER":
        return "Teacher Dashboard";
      default:
        return role;
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Switch Role
        </CardTitle>
        <CardDescription className="text-xs">
          You can switch between HOD and Teacher dashboards.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {roles.map((role) => (
          <div
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
              ${
                activeRole === role
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded ${
                  activeRole === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {getRoleIcon(role)}
              </div>

              <div>
                <p className="font-medium">{getRoleLabel(role)}</p>
                <p className="text-xs text-muted-foreground">
                  {role === "HOD" && "Department management & approvals"}
                  {role === "TEACHER" && "Personal teaching workspace"}
                </p>
              </div>
            </div>

            {activeRole === role && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
