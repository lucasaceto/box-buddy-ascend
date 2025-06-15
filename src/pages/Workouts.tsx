
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

type Workout = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  duration_minutes: number | null;
};

function NewWorkoutForm({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const createWorkout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("workouts").insert([
        {
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
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); createWorkout.mutate(); }}
      className="flex flex-col gap-3 p-4 border rounded bg-muted/30 max-w-lg"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input type="number" value={duration} onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Duración (minutos)" min={0} />
      <Button type="submit" disabled={createWorkout.isPending}>Agregar</Button>
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
      className="flex flex-col gap-3 p-4 border rounded bg-muted/30 max-w-lg"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input type="number" value={duration} onChange={e => setDuration(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Duración (minutos)" min={0} />
      <div className="flex gap-2">
        <Button type="submit" disabled={updateMutation.isPending}>Guardar</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}

export default function WorkoutsPage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<null | Workout>(null);
  const queryClient = useQueryClient();
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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mis Entrenamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <NewWorkoutForm onCreated={() => queryClient.invalidateQueries({ queryKey: ["workouts"] })} />
          <div className="mt-6">
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
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data && query.data.length > 0 ? (
                    query.data.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{w.name}</TableCell>
                        <TableCell>{w.date ? new Date(w.date).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{w.duration_minutes ? `${w.duration_minutes} min` : "-"}</TableCell>
                        <TableCell>
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
          </div>
        </CardContent>
      </Card>
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <EditWorkoutForm workout={editing} onClose={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
