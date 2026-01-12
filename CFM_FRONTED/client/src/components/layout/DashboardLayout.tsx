import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

// 🔥 NEW role-based sidebars
import TeacherSidebar from "./TeacherSidebar";
import HodSidebar from "./HodSidebar";
import {SubjectHeadSidebar } from "./SubjectHeadSidebar";

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeRole } = useAuth();

  // Decide sidebar ONCE
  //const SidebarComponent =
   // activeRole === "HOD" ? HodSidebar : TeacherSidebar;

    const SidebarComponent = () => {
    if (activeRole === "HOD") return <HodSidebar />;
    if (activeRole === "SUBJECT_HEAD") return <SubjectHeadSidebar />;
    return <TeacherSidebar />;
  };
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* ================= Desktop Sidebar ================= */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <SidebarComponent />
      </div>

      {/* ================= Mobile Sidebar ================= */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r">
          <SidebarComponent />
        </SheetContent>
      </Sheet>

      {/* ================= Main Content ================= */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <ErrorBoundary>
              {children ?? <Outlet />}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
