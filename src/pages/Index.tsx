// Página principal dashboard CrossFit

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Medal, Flame, Activity, BarChart2, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const statCards = [
  {
    label: "WOD de hoy",
    value: "21-15-9 Fran",
    icon: <Flame size={32} className="text-orange-400" />,
    desc: "Tiempo récord: 3:05",
  },
  {
    label: "PRs Registrados",
    value: "16",
    icon: <Medal size={32} className="text-lime-400" />,
    desc: "Último: Back Squat 120kg",
  },
  {
    label: "Sesiones este mes",
    value: "12",
    icon: <Activity size={32} className="text-blue-400" />,
    desc: "Promedio: 35 min/entreno",
  },
  {
    label: "Progreso % Mes",
    value: "+8%",
    icon: <BarChart2 size={32} className="text-cyan-400" />,
    desc: "Mejoría vs. mes anterior",
  },
];

const feed = [
  { user: "Ana", action: "Registró PR", detail: "Deadlift 105kg", time: "hace 17min" },
  { user: "Carlos", action: "Completó WOD", detail: "Murph RX", time: "hace 35min" },
  { user: "Laura", action: "Nuevo entrenamiento creado", detail: "EMOM 18'", time: "hace 1h" },
];

const Index = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen font-sans bg-gradient-to-br from-blue-50 to-blue-100">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Barra superior */}
          <header className="flex items-center justify-between px-8 h-16 shadow-sm bg-white/80 border-b border-blue-100">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Dashboard</h1>
            <div className="flex items-center gap-6">
              <button className="relative group">
                <Bell size={24} className="text-blue-900/80 hover:text-primary transition" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-orange-400 border-2 border-white animate-ping"></span>
              </button>
              <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-3 py-1">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-primary"
                />
                <span className="font-semibold text-blue-900">
                  {user?.user_metadata?.username ? user.user_metadata.username : "Entrenador"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title="Cerrar sesión"
                  onClick={logout}
                >
                  <LogOut />
                </Button>
              </div>
            </div>
          </header>
          {/* Paneles estadísticos principales */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 animate-fade-in">
            {statCards.map((item) => (
              <div
                key={item.label}
                className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-start gap-3 ring-1 ring-blue-100 hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div>{item.icon}</div>
                <div>
                  <span className="block text-sm text-muted-foreground">{item.label}</span>
                  <span className="block text-xl font-bold text-primary">{item.value}</span>
                </div>
                <span className="text-xs text-blue-600">{item.desc}</span>
              </div>
            ))}
          </section>
          {/* Feed de actividad y panel de bienvenida */}
          <div className="flex flex-col lg:flex-row gap-8 p-8 flex-1">
            <section className="bg-white flex-1 shadow-lg rounded-xl p-6 overflow-auto animate-fade-in">
              <h2 className="text-lg font-semibold mb-4 text-primary">Actividad Reciente</h2>
              <ul>
                {feed.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 py-2 border-b border-blue-50 last:border-b-0">
                    <span className="font-bold text-blue-900">{item.user}</span>
                    <span className="text-sm text-muted-foreground">{item.action}</span>
                    <span className="font-medium text-primary">{item.detail}</span>
                    <span className="ml-auto text-xs text-blue-400">{item.time}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="bg-gradient-to-tr from-primary to-cyan-700/80 text-white shadow-lg rounded-xl p-8 w-full max-w-sm flex flex-col items-center justify-center animate-fade-in">
              <h3 className="text-xl font-bold mb-4">¡Bienvenido al Box!</h3>
              <p className="text-white/90 text-base mb-6 text-center">Empieza a registrar tus avances.<br/> Accede al catálogo de ejercicios y personaliza tus entrenamientos.</p>
              <button className="bg-white text-primary px-6 py-2 rounded-full font-bold shadow hover:scale-105 hover:bg-blue-100 transition-all">Crear entrenamiento</button>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
