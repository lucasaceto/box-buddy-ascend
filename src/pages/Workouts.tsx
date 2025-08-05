
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";

type Workout = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  duration_minutes: number | null;
  user_id: string | null;
};

function NewWorkoutForm({ onCreated, onDone }: { onCreated: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState<number | "">("");

  const createWorkout = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debes iniciar sesión para crear un entrenamiento.");
      const { error } = await supabase.from("workouts").insert([
        {
          user_id: user.id,
          name,
          description,
          date: date || null,
          duration_minutes: duration === "" ? null : Number(duration),
        }
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Entrenamiento creado" });
      setName(""); setDescription(""); setDate(""); setDuration("");
      onCreated();
      onDone();
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); createWorkout.mutate(); }}
      className="flex flex-col gap-4 pt-4"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input type="number" value={duration} onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Duración (minutos)" min={0} />
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={createWorkout.isPending}>Agregar</Button>
      </div>
    </form>
  );
}

function EditWorkoutForm({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState(workout.name);
  const [description, setDescription] = useState(workout.description || "");
  const [date, setDate] = useState(workout.date || "");
  const [duration, setDuration] = useState(workout.duration_minutes ?? "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("workouts")
        .update({
          name,
          description,
          date: date || null,
          duration_minutes: duration === "" ? null : Number(duration),
        })
        .eq("id", workout.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Entrenamiento actualizado" });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      onClose();
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); updateMutation.mutate(); }}
      className="flex flex-col gap-4 pt-4"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input type="number" value={duration} onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Duración (minutos)" min={0} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={updateMutation.isPending}>Guardar</Button>
      </div>
    </form>
  );
}

export default function WorkoutsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<null | Workout>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Abrir automáticamente el dialog de creación si viene del dashboard
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateDialogOpen(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  
  const query = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Workout[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Entrenamiento eliminado" });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  const handleBackClick = () => {
    console.log("Back button clicked");
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick}
            type="button"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Mis Entrenamientos</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2" /> Crear Entrenamiento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Entrenamiento</DialogTitle>
            </DialogHeader>
            <NewWorkoutForm
              onCreated={() => queryClient.invalidateQueries({ queryKey: ["workouts"] })}
              onDone={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {query.isLoading ? (
            <div>Cargando entrenamientos...</div>
          ) : query.isError ? (
            <div className="text-destructive">Error: {(query.error as Error).message}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data && query.data.length > 0 ? (
                  query.data.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.name}</TableCell>
                      <TableCell>{w.date ? new Date(w.date + "T00:00:00").toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{w.duration_minutes ? `${w.duration_minutes} min` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(w)}>
                          <Pencil className="text-muted-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(w.id)}>
                          <Trash2 className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay entrenamientos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!editing} onOpenChange={(isOpen) => !isOpen && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Entrenamiento</DialogTitle>
          </DialogHeader>
          {editing && <EditWorkoutForm workout={editing} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
