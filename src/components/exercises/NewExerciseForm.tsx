
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface NewExerciseFormProps {
  onCreated: () => void;
  onDone: () => void;
}

export default function NewExerciseForm({ onCreated, onDone }: NewExerciseFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const { user, loading } = useAuth();

  const createExercise = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Debes iniciar sesión para crear un ejercicio.");
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
      onSubmit={e => { e.preventDefault(); if (!user?.id) return; createExercise.mutate(); }}
      className="flex flex-col gap-4 pt-4"
    >
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required disabled={createExercise.isPending || loading || !user?.id} />
      <Input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo (opcional: fuerza, cardio…)" disabled={createExercise.isPending || loading || !user?.id} />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" disabled={createExercise.isPending || loading || !user?.id} />
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={createExercise.isPending}>Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={createExercise.isPending || loading || !user?.id}>Agregar</Button>
      </div>
      {!user?.id && (
        <div className="text-destructive text-xs pt-2">Inicia sesión antes de crear un ejercicio.</div>
      )}
    </form>
  );
}
