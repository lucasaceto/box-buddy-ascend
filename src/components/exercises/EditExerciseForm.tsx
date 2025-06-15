
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  user_id: string | null;
}

export default function EditExerciseForm({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
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
