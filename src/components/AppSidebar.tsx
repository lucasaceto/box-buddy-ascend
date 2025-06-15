
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
  return (
    <Sidebar className="bg-gradient-to-b from-primary to-blue-900 text-white shadow-xl border-none min-w-[220px] font-sans">
      <SidebarContent>
        <div className="py-8 flex flex-col items-center gap-4">
          <div className="rounded-full bg-white/10 border border-primary w-16 h-16 flex items-center justify-center shadow hover:scale-105 transition-transform">
            <img
              src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
              alt="Box Avatar"
              className="w-12 h-12"
            />
          </div>
          <span className="text-lg font-bold tracking-tight mt-1">BoxFit Pro</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-white/70 mb-2 px-6">Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-6 py-2 rounded-lg text-base hover:bg-white/10 hover:pl-8 transition-all duration-200 group">
                      <item.icon size={22} className="text-white/80 group-hover:text-aqua-400" />
                      <span className="font-medium">{item.title}</span>
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
