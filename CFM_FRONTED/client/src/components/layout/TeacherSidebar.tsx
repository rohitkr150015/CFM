import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";
import { sidebarItems, currentUser } from "@/lib/dummy-data";

export default function TeacherSidebar() {
  return (
    <aside className="flex flex-col h-full w-64 border-r bg-sidebar">
      <SidebarHeader
        title="CourseFlow"
        subtitle={currentUser.department}
      />

      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={`/teacher/${item.href}`}
          />
        ))}
      </nav>
    </aside>
  );
}
