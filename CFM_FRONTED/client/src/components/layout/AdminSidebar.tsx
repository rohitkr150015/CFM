
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { adminSidebarItems } from "@/lib/dummy-data";
import { useAuth } from "@/contexts/AuthContext";

export function AdminSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className={cn("flex flex-col h-full border-r bg-slate-900 text-slate-50", className)}>
      <div className="p-6 flex items-center gap-2 border-b border-slate-800">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight block leading-none">AdminPanel</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">System Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminSidebarItems.map((item) => {
          // Check if current location starts with the item href (for active states on sub-pages)
          // Exact match for dashboard, prefix match for others
          const isActive = item.href === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.href);

          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'Admin User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@example.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
