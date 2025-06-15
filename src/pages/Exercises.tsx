
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

type Exercise = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  user_id: string | null;
};

function NewExerciseForm({ onCreated, onDone }: { onCreated: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();

  const createExercise = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debes iniciar sesión para crear un ejercicio.");
      const { error } = await supabase.from("exercises").insert([
        {
          user_id: user.id,
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
      onDone();
    },
    onError: err => {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); createExercise.mutate(); }}
      className="flex flex-col gap-4 pt-4"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo (opcional: fuerza, cardio…)" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={createExercise.isPending}>Agregar</Button>
      </div>
    </form>
  );
}

function EditExerciseForm({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
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
      className="flex flex-col gap-4 pt-4"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
      <Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo (opcional: fuerza, cardio…)" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={updateMutation.isPending}>Guardar</Button>
      </div>
    </form>
  );
}

export default function ExercisesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editing, setEditing] = useState<null | Exercise>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Ejercicios</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2" /> Crear Ejercicio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Ejercicio</DialogTitle>
            </DialogHeader>
            <NewExerciseForm
              onCreated={() => queryClient.invalidateQueries({ queryKey: ["exercises"] })}
              onDone={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data && query.data.length > 0 ? (
                  query.data.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell>{ex.name}</TableCell>
                      <TableCell>{ex.type || "-"}</TableCell>
                      <TableCell className="text-right">
                        {ex.user_id === user?.id ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(ex)}>
                              <Pencil className="text-muted-foreground" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(ex.id)}>
                              <Trash2 className="text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Global</span>
                        )}
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
        </CardContent>
      </Card>
      <Dialog open={!!editing} onOpenChange={(isOpen) => !isOpen && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ejercicio</DialogTitle>
          </DialogHeader>
          {editing && <EditExerciseForm exercise={editing} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
