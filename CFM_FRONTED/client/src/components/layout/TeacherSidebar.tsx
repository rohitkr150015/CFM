import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useEffect, useState } from "react";
import { authFetch } from "@/utils/authFetch";
import { Mail } from "lucide-react";
import { sidebarItems } from "@/lib/dummy-data";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";

interface ProfileData {
  name: string;
  email: string;
  departmentName?: string;
  profileImageUrl?: string | null;
}

export default function TeacherSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [helpEmail, setHelpEmail] = useState("cfmteam.help@gmail.com");

  useEffect(() => {
    loadProfile();
    loadSettings();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authFetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/public/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.support_email) {
          setHelpEmail(data.support_email);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.username?.substring(0, 2).toUpperCase() || "US";
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  // Filter sidebar items based on permissions
  const filteredItems = sidebarItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  return (
    <aside className="flex flex-col h-full w-64 border-r bg-sidebar">
      <SidebarHeader
        title="CourseFlow"
        subtitle={profile?.departmentName || "Teacher"}
      />

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={`/teacher/${item.href}`}
          />
        ))}
      </nav>

      {/* User Info + Help Email at Bottom */}
      <div className="p-4 border-t border-sidebar-border/50 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold overflow-hidden">
            {profile?.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-primary">{getInitials(profile?.name)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name || user?.username || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email || "user@example.com"}</p>
          </div>
        </div>

        {/* Help Email */}
        <div className="flex items-center gap-2 px-2 py-2 bg-muted/50 rounded-lg">
          <Mail className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">Help & Support</p>
            <a
              href={`mailto:${helpEmail}`}
              className="text-xs text-primary hover:underline truncate block"
            >
              {helpEmail}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
