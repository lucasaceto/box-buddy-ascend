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
import { Dumbbell, Settings, User, Home, Calendar, ActivitySquare, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Usamos useLocation para resaltar el menú seleccionado, opcional para UX visual
const menus = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Entrenamientos", url: "/workouts", icon: ActivitySquare },
  { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
  { title: "PRs", url: "/prs", icon: Trophy },
  { title: "Perfil", url: "/profile", icon: User },
  { title: "Calendario", url: "/calendar", icon: Calendar },
  { title: "Configuración", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
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
              {menus.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.url === "#" ? (
                      <span
                        className="flex items-center gap-3 px-6 py-2 rounded-lg text-base font-semibold text-sidebar-foreground opacity-60 cursor-not-allowed"
                        tabIndex={-1}
                        aria-disabled
                      >
                        <item.icon size={22} className="transition-colors" />
                        <span className="font-semibold">{item.title}</span>
                      </span>
                    ) : (
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-6 py-2 rounded-lg text-base font-semibold transition-all duration-200 group 
                          ${
                            location.pathname === item.url
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                          }`}
                        tabIndex={0}
                      >
                        <item.icon size={22} className="transition-colors" />
                        <span className="font-semibold">{item.title}</span>
                      </Link>
                    )}
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
