import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";
import { hodSidebarItems, currentUser } from "@/lib/dummy-data";

export default function HodSidebar() {
  return (
    <aside className="flex flex-col h-full w-64 border-r bg-sidebar">
      <SidebarHeader
        title="CourseFlow"
        subtitle={`${currentUser.department} (HOD)`}
      />

      <nav className="flex-1 p-4 space-y-1">
        {hodSidebarItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </nav>
    </aside>
  );
}
