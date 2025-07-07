import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { format, parseISO, subMonths, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PR {
  id: string;
  exercise_id: string;
  value: number;
  unit: string;
  date_achieved: string;
  notes: string;
  exercises?: {
    name: string;
    type: string;
  };
}

export function PRsOverview() {
  const { user } = useAuth();

  const { data: prs = [], isLoading } = useQuery({
    queryKey: ['prs-overview', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("prs")
        .select(`
          *,
          exercises (
            name,
            type
          )
        `)
        .eq("user_id", user.id)
        .order("date_achieved", { ascending: false });
      
      if (error) throw new Error(error.message);
      return data as PR[];
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    // PRs de los últimos 6 meses
    const sixMonthsAgo = subMonths(new Date(), 6);
    const recentPRs = prs.filter(pr => 
      pr.date_achieved && isAfter(parseISO(pr.date_achieved), sixMonthsAgo)
    );

    // Agrupar por mes
    const monthlyData: Record<string, number> = {};
    recentPRs.forEach(pr => {
      if (pr.date_achieved) {
        const monthKey = format(parseISO(pr.date_achieved), "MMM yyyy", { locale: es });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [prs]);

  const stats = useMemo(() => {
    const totalPRs = prs.length;
    const currentYear = new Date().getFullYear();
    const thisYearPRs = prs.filter(pr => 
      pr.date_achieved && new Date(pr.date_achieved).getFullYear() === currentYear
    );
    const uniqueExercises = new Set(prs.map(pr => pr.exercise_id)).size;
    const lastThreeMonths = subMonths(new Date(), 3);
    const recentPRs = prs.filter(pr => 
      pr.date_achieved && isAfter(parseISO(pr.date_achieved), lastThreeMonths)
    );

    return {
      totalPRs,
      thisYearPRs: thisYearPRs.length,
      uniqueExercises,
      recentPRsCount: recentPRs.length
    };
  }, [prs]);

  const chartConfig = {
    count: {
      label: "PRs",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Resumen de PRs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPRs}</div>
            <p className="text-xs text-muted-foreground">Records personales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Año</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisYearPRs}</div>
            <p className="text-xs text-muted-foreground">PRs en {new Date().getFullYear()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueExercises}</div>
            <p className="text-xs text-muted-foreground">Con PRs registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Progreso de PRs (6 meses)</CardTitle>
            <CardDescription>
              Evolución de tus records personales en los últimos meses
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/prs">
              Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center space-y-2">
                <Trophy className="h-8 w-8 mx-auto opacity-50" />
                <p>No hay PRs registrados aún</p>
                <p className="text-xs">¡Empieza a registrar tus records personales!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent PRs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>PRs Recientes</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/prs">
              Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {prs.slice(0, 3).length > 0 ? (
            <div className="space-y-3">
              {prs.slice(0, 3).map((pr) => (
                <div key={pr.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{pr.exercises?.name || "Ejercicio desconocido"}</p>
                    <p className="text-sm text-muted-foreground">
                      {pr.date_achieved ? format(parseISO(pr.date_achieved), "dd MMM yyyy", { locale: es }) : "Sin fecha"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pr.value}{pr.unit && ` ${pr.unit}`}</p>
                    {pr.notes && (
                      <p className="text-xs text-muted-foreground max-w-[120px] truncate" title={pr.notes}>
                        {pr.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p>No hay PRs registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}