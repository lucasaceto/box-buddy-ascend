import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Trophy, TrendingUp, Calendar, Target } from "lucide-react";
import { format, parseISO, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

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

export default function PRsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_achieved");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterYear, setFilterYear] = useState<string>("all");

  // Fetch PRs con datos de ejercicios
  const { data: prs = [], isLoading } = useQuery({
    queryKey: ['prs-detailed', user?.id],
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

  // Años disponibles para filtro
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    prs.forEach(pr => {
      if (pr.date_achieved) {
        years.add(new Date(pr.date_achieved).getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [prs]);

  // Filtrar y ordenar PRs
  const filteredAndSortedPRs = useMemo(() => {
    let filtered = prs.filter(pr => {
      const matchesSearch = pr.exercises?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pr.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = filterYear === "all" || 
                         (pr.date_achieved && new Date(pr.date_achieved).getFullYear().toString() === filterYear);
      
      return matchesSearch && matchesYear;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "exercise_name":
          aValue = a.exercises?.name || "";
          bValue = b.exercises?.name || "";
          break;
        case "value":
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        case "date_achieved":
        default:
          aValue = new Date(a.date_achieved || 0).getTime();
          bValue = new Date(b.date_achieved || 0).getTime();
          break;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [prs, searchTerm, sortBy, sortOrder, filterYear]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Agrupar PRs por ejercicio para mostrar progreso temporal
    const exerciseGroups: Record<string, PR[]> = {};
    prs.forEach(pr => {
      const exerciseName = pr.exercises?.name || "Desconocido";
      if (!exerciseGroups[exerciseName]) {
        exerciseGroups[exerciseName] = [];
      }
      exerciseGroups[exerciseName].push(pr);
    });

    // Crear datos para gráfico de líneas (progreso temporal)
    const progressData: any[] = [];
    Object.entries(exerciseGroups).forEach(([exerciseName, exercisePRs]) => {
      if (exercisePRs.length > 1) {
        exercisePRs
          .sort((a, b) => new Date(a.date_achieved || 0).getTime() - new Date(b.date_achieved || 0).getTime())
          .forEach((pr, index) => {
            progressData.push({
              date: pr.date_achieved,
              exercise: exerciseName,
              value: pr.value,
              formattedDate: pr.date_achieved ? format(parseISO(pr.date_achieved), "MMM yyyy", { locale: es }) : "",
              unit: pr.unit
            });
          });
      }
    });

    // Datos para gráfico de barras (PRs por mes del año actual)
    const currentYear = new Date().getFullYear();
    const currentYearPRs = prs.filter(pr => 
      pr.date_achieved && new Date(pr.date_achieved).getFullYear() === currentYear
    );
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(currentYear, i, 1), "MMM", { locale: es }),
      count: 0
    }));

    currentYearPRs.forEach(pr => {
      if (pr.date_achieved) {
        const month = new Date(pr.date_achieved).getMonth();
        monthlyData[month].count++;
      }
    });

    return { progressData, monthlyData };
  }, [prs]);

  // Estadísticas resumidas
  const stats = useMemo(() => {
    const totalPRs = prs.length;
    const currentYear = new Date().getFullYear();
    const thisYearPRs = prs.filter(pr => 
      pr.date_achieved && new Date(pr.date_achieved).getFullYear() === currentYear
    );
    const uniqueExercises = new Set(prs.map(pr => pr.exercise_id)).size;
    const recentPR = prs[0];

    return {
      totalPRs,
      thisYearPRs: thisYearPRs.length,
      uniqueExercises,
      recentPR
    };
  }, [prs]);

  const chartConfig = {
    value: {
      label: "Valor",
      color: "hsl(var(--primary))",
    },
    count: {
      label: "PRs",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg">Cargando PRs...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100">
        <AppSidebar />
        <main className="flex-1 p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              Mis Records Personales
            </h1>
            <p className="text-muted-foreground">
              Visualiza y analiza tu progreso a través de todos tus PRs registrados
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPRs}</div>
                <p className="text-xs text-muted-foreground">Records registrados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Año</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground">Diferentes ejercicios</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último PR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.recentPR ? `${stats.recentPR.value}${stats.recentPR.unit || ""}` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.recentPR?.exercises?.name || "Sin PRs"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progreso Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso de PRs por Ejercicio</CardTitle>
                <CardDescription>Evolución temporal de tus records</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* PRs por Mes */}
            <Card>
              <CardHeader>
                <CardTitle>PRs por Mes ({new Date().getFullYear()})</CardTitle>
                <CardDescription>Distribución de records en el año actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Controles */}
          <Card>
            <CardHeader>
              <CardTitle>Lista Detallada de PRs</CardTitle>
              <CardDescription>Filtra y ordena tus records personales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por ejercicio o notas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_achieved">Fecha</SelectItem>
                    <SelectItem value="exercise_name">Ejercicio</SelectItem>
                    <SelectItem value="value">Valor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla de PRs */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ejercicio</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedPRs.length > 0 ? (
                      filteredAndSortedPRs.map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="font-medium">
                            {pr.exercises?.name || "Ejercicio desconocido"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {pr.value}{pr.unit && ` ${pr.unit}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {pr.date_achieved ? format(parseISO(pr.date_achieved), "dd/MM/yyyy", { locale: es }) : "N/A"}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={pr.notes || ""}>
                            {pr.notes || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {pr.exercises?.type || "N/A"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {searchTerm || filterYear !== "all" 
                            ? "No se encontraron PRs con los filtros aplicados" 
                            : "No tienes PRs registrados aún"
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}