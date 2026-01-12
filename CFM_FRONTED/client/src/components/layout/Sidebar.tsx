import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sidebarItems, currentUser } from "@/lib/dummy-data";

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <aside className={cn("flex flex-col h-full border-r bg-sidebar text-sidebar-foreground", className)}>
      <div className="p-6 flex items-center gap-2 border-b border-sidebar-border/50">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-primary-foreground"
          >
            <path d="M2 6h4" />
            <path d="M2 10h4" />
            <path d="M2 14h4" />
            <path d="M2 18h4" />
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M16 2v20" />
          </svg>
        </div>
        <div>
           <span className="font-bold text-xl tracking-tight block leading-none">CourseFlow</span>
           <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{currentUser.department}</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <div className="bg-sidebar-accent/50 rounded-lg p-4">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Storage</h4>
          <div className="flex justify-between text-xs text-sidebar-foreground mb-1">
            <span>12.5 GB</span>
            <span>50 GB</span>
          </div>
          <div className="h-1.5 w-full bg-sidebar-border rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[25%]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
