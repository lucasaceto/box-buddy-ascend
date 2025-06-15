import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Exercise = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
};

function NewExerciseForm({ onCreated }: { onCreated: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const createExercise = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("exercises").insert([
        {
          name,
          type: type || null,
          description,
        }
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Ejercicio creado" });
      setName(""); setType(""); setDescription("");
      onCreated();
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); createExercise.mutate(); }}
      className="flex flex-col gap-3 p-4 border rounded bg-muted/30 max-w-lg"
    >
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => navigate("/exercises")}
          className="flex items-center gap-1 text-primary hover:underline font-medium mb-2"
        >
          <ArrowLeft size={20} /> Volver
        </button>
      </div>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo (opcional: fuerza, cardio…)" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <Button type="submit" disabled={createExercise.isPending}>Agregar</Button>
    </form>
  );
}

function EditExerciseForm({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(exercise.name);
  const [type, setType] = useState(exercise.type || "");
  const [description, setDescription] = useState(exercise.description ?? "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("exercises")
        .update({
          name,
          type: type || null,
          description,
        })
        .eq("id", exercise.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Ejercicio actualizado" });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
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
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => navigate("/exercises")}
          className="flex items-center gap-1 text-primary hover:underline font-medium mb-2"
        >
          <ArrowLeft size={20} /> Volver
        </button>
      </div>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo (opcional: fuerza, cardio…)" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <div className="flex gap-2">
        <Button type="submit" disabled={updateMutation.isPending}>Guardar</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}

export default function ExercisesPage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<null | Exercise>(null);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exercises").select("*").order("name");
      if (error) throw new Error(error.message);
      return data as Exercise[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exercises").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Ejercicio eliminado" });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Ejercicios</CardTitle>
        </CardHeader>
        <CardContent>
          <NewExerciseForm onCreated={() => queryClient.invalidateQueries({ queryKey: ["exercises"] })} />
          <div className="mt-6">
            {query.isLoading ? (
              <div>Cargando ejercicios...</div>
            ) : query.isError ? (
              <div className="text-destructive">Error: {(query.error as Error).message}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data && query.data.length > 0 ? (
                    query.data.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell>{ex.name}</TableCell>
                        <TableCell>{ex.type || "-"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(ex)}>
                            <Pencil className="text-muted-foreground" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(ex.id)}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No hay ejercicios registrados.
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
          <EditExerciseForm exercise={editing} onClose={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
