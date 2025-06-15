import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Dumbbell, Settings, User, Home, Calendar, ActivitySquare } from "lucide-react";

const menus = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Ejercicios", url: "#", icon: Dumbbell },
  { title: "Entrenamientos", url: "#", icon: ActivitySquare },
  { title: "Calendario", url: "#", icon: Calendar },
  { title: "Perfil", url: "#", icon: User },
  { title: "Configuración", url: "#", icon: Settings },
];

export function AppSidebar() {
  // Insert/update for proper hrefs
  const updatedMenus = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Entrenamientos", url: "/workouts", icon: ActivitySquare },
    { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
    { title: "Perfil", url: "#", icon: User },
    { title: "Calendario", url: "#", icon: Calendar },
    { title: "Configuración", url: "#", icon: Settings },
  ];
  return (
    <Sidebar className="shadow-xl border-none min-w-[220px] font-sans">
      <SidebarContent>
        <div className="py-8 flex flex-col items-center gap-4">
          <div className="rounded-full bg-white/10 border-2 border-sidebar-accent w-16 h-16 flex items-center justify-center shadow hover:scale-105 transition-transform">
            <img
              src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
              alt="Box Avatar"
              className="w-12 h-12"
            />
          </div>
          <span className="text-lg font-bold tracking-tight mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">BoxFit Pro</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide mb-2 px-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.04)]">Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {updatedMenus.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-6 py-2 rounded-lg text-base font-semibold text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground transition-all duration-200 group"
                      tabIndex={0}
                    >
                      <item.icon
                        size={22}
                        className="transition-colors"
                      />
                      <span className="font-semibold">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
