import { Bell, Search, LogOut, User, Settings, Moon, Sun, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { authFetch } from "@/utils/authFetch";

interface NotificationItem {
  id: number;
  type: string;
  payload: string;
  isRead: boolean;
  createdAt: string;
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadProfileImage();
    loadNotifications();
    window.addEventListener("profile-updated", loadProfileImage);

    // Poll notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      window.removeEventListener("profile-updated", loadProfileImage);
      clearInterval(interval);
    };
  }, []);

  const loadProfileImage = async () => {
    try {
      const res = await authFetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profileImageUrl) {
          setProfileImage(data.profileImageUrl);
        }
      }
    } catch (error) {
      console.error("Failed to load profile image", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        authFetch("/api/notifications"),
        authFetch("/api/notifications/unread-count")
      ]);

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.slice(0, 10)); // Show latest 10
      }

      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.count || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await authFetch("/api/notifications/mark-all-read", { method: "PUT" });
      // Clear notifications from the dropdown
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettingsClick = () => {
    const role = user?.role;
    if (role === "ADMIN") navigate("/admin/settings");
    else if (role === "HOD") navigate("/hod/settings");
    else if (role === "SUBJECT_HEAD") navigate("/subject-head/settings");
    else navigate("/teacher/settings");
  };

  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const parsePayload = (payload: string) => {
    try {
      return JSON.parse(payload);
    } catch {
      return { message: payload };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <span className="sr-only">Toggle menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
        </Button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses, files..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleDark}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end" forceMount>
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="py-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />

            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => {
                  const payload = parsePayload(notif.payload);
                  const isPermissionChange = notif.type === "PERMISSION_CHANGED";
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${!notif.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                        }`}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`h-2 w-2 rounded-full mt-1.5 ${!notif.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.type?.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {payload.message || payload.title || "New notification"}
                          </p>
                          {isPermissionChange && payload.oldPermissions && payload.newPermissions && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
                              <p className="font-medium text-foreground">Role: {payload.roleName}</p>
                              <p className="text-red-500 line-through">
                                Old: {Array.isArray(payload.oldPermissions) ? payload.oldPermissions.join(", ") : payload.oldPermissions}
                              </p>
                              <p className="text-green-600">
                                New: {Array.isArray(payload.newPermissions) ? payload.newPermissions.join(", ") : payload.newPermissions}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}>
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={profileImage || undefined} alt={user?.username} />
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettingsClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleDark}>
              {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
