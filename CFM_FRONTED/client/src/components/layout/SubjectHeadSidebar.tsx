import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";

const subjectHeadItems = [
  { icon: Home, label: "Dashboard", href: "/subject-head/dashboard" },
  { icon: BookOpen, label: "Subjects", href: "/subject-head/subjects" },
  { icon: FileText, label: "Reviews", href: "/subject-head/reviews" },
  { icon: MessageSquare, label: "Comments", href: "/subject-head/comments" },
  { icon: Settings, label: "Settings", href: "/subject-head/settings" },
];

export function SubjectHeadSidebar() {
  const location = useLocation();

  return (
    <aside className="h-full w-64 border-r bg-sidebar">
      <div className="p-6 font-bold text-lg border-b">Subject Head</div>

      <nav className="p-4 space-y-1">
        {subjectHeadItems.map((item) => {
          const active = location.pathname === item.href;

          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
