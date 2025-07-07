
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Medal, Flame, Activity, BarChart2, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, subMonths, format, isSameMonth, isSameYear } from "date-fns";
import { Link } from "react-router-dom";
import { StatCards } from "@/components/dashboard/StatCards";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WelcomePanel } from "@/components/dashboard/WelcomePanel";
import { PRsOverview } from "@/components/dashboard/PRsOverview";

// Helpers para fechas (puedes mover a utils si crece el dashboard)
const getMonthRange = (date: Date) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

export default function Index() {
  const { user, logout } = useAuth();

  // Consultar datos dinamicos relevantes para los stats
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: prs = [], isLoading: prsLoading } = useQuery({
    queryKey: ['prs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", user.id)
        .order("date_achieved", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Feed de actividad: fetch últimos eventos relevantes para ese usuario
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities_feed", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Actividades: PRs recientes, Workouts completados, nuevos entrenamientos creados, ejercicios creados
      const [prsRes, userWorkoutsRes, workoutsRes, exercisesRes] = await Promise.all([
        supabase.from("prs").select("id, value, unit, date_achieved, notes, exercise_id").eq("user_id", user.id).order("date_achieved", { ascending: false }).limit(3),
        supabase.from("user_workouts").select("id, date_completed, performance_score, notes, workout_id").eq("user_id", user.id).order("date_completed", { ascending: false }).limit(3),
        supabase.from("workouts").select("id, name, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("exercises").select("id, name, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      ]);
      let feed: any[] = [];
      if (prsRes.data) {
        feed = feed.concat(
          prsRes.data.map((pr) => ({
            type: "pr",
            title: "Nuevo PR",
            detail: `${pr.value}${pr.unit ? ' ' + pr.unit : ""} (${pr.notes || "Sin notas"})`,
            date: pr.date_achieved || null,
            time: pr.date_achieved,
          }))
        );
      }
      if (userWorkoutsRes.data) {
        feed = feed.concat(
          userWorkoutsRes.data.map((uw) => ({
            type: "workout",
            title: "WOD completado",
            detail: `${uw.performance_score ? uw.performance_score + ' pts · ' : ""}${uw.notes || ""}`,
            date: uw.date_completed,
            time: uw.date_completed,
          }))
        );
      }
      if (workoutsRes.data) {
        feed = feed.concat(
          workoutsRes.data.map((w) => ({
            type: "created_workout",
            title: "Entrenamiento creado",
            detail: w.name,
            date: w.created_at,
            time: w.created_at,
          }))
        );
      }
      if (exercisesRes.data) {
        feed = feed.concat(
          exercisesRes.data.map((ex) => ({
            type: "created_exercise",
            title: "Ejercicio creado",
            detail: ex.name + (ex.description ? ` - ${ex.description.slice(0, 50)}${ex.description.length > 50 ? '...' : ''}` : ""),
            date: ex.created_at,
            time: ex.created_at,
          }))
        );
      }
      // Ordenar por fecha descendente y limitar a 6 eventos
      feed.sort((a, b) => new Date(b.date || b.time).getTime() - new Date(a.date || a.time).getTime());
      return feed.slice(0, 6);
    },
    enabled: !!user,
  });

  // Stats calculados
  const todayWod = useMemo(() => workouts[0] || null, [workouts]);
  const totalPrs = prs.length;
  const latestPr = prs[0];
  const now = new Date();
  const thisMonth = getMonthRange(now);
  const lastMonth = getMonthRange(subMonths(now, 1));
  // Sesiones este mes
  const sessionsThisMonth = workouts.filter(w =>
    w.date &&
    isSameMonth(new Date(w.date), now) &&
    isSameYear(new Date(w.date), now)
  );
  // Sesiones mes pasado
  const sessionsLastMonth = workouts.filter(w =>
    w.date &&
    isSameMonth(new Date(w.date), lastMonth.start) &&
    isSameYear(new Date(w.date), lastMonth.start)
  );
  // Progreso %
  const progreso =
    sessionsLastMonth.length === 0
      ? sessionsThisMonth.length > 0 ? 100 : 0
      : Math.round(
          ((sessionsThisMonth.length - sessionsLastMonth.length) /
            sessionsLastMonth.length) *
            100
        );

  // Cards dinámicos
  const statCards = [
    {
      label: "WOD de hoy",
      value: todayWod ? todayWod.name : "Sin entreno",
      icon: <Flame size={32} className="text-orange-400" />,
      desc: todayWod
        ? todayWod.description?.slice(0, 60) || "¡Dale fuerte hoy!"
        : "No hay WOD programado",
    },
    {
      label: "PRs Registrados",
      value: String(totalPrs),
      icon: <Medal size={32} className="text-lime-400" />,
      desc: latestPr
        ? `Último: ${latestPr.value ?? "-"}${latestPr.unit ? ' ' + latestPr.unit : ""}`
        : "Sin PRs aún",
    },
    {
      label: "Sesiones este mes",
      value: String(sessionsThisMonth.length),
      icon: <Activity size={32} className="text-blue-400" />,
      desc: `Promedio: ${
        sessionsThisMonth.length > 0
          ? Math.round(
              (sessionsThisMonth.reduce((a, b) => a + (b.duration_minutes || 0), 0) || 0) /
                sessionsThisMonth.length
            )
          : 0
      } min/entreno`,
    },
    {
      label: "Progreso % Mes",
      value: `${progreso > 0 ? "+" : ""}${progreso}%`,
      icon: <BarChart2 size={32} className="text-cyan-400" />,
      desc:
        progreso > 0
          ? `Mejoría vs. mes anterior`
          : progreso < 0
          ? "Menos sesiones que el mes pasado"
          : "Sin cambios vs. mes anterior",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen font-sans bg-gradient-to-br from-blue-50 to-blue-100 w-full">
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
          <StatCards cards={statCards} />
          {/* Feed de actividad y panel de bienvenida */}
          <div className="flex flex-col xl:flex-row gap-8 p-8 flex-1 min-w-0">
            <div className="flex-1 space-y-8">
              <ActivityFeed activities={activities} loading={activitiesLoading} />
            </div>
            <div className="xl:w-96 space-y-8">
              <WelcomePanel />
              <PRsOverview />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
