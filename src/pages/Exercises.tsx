
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateExerciseDialog from "@/components/exercises/CreateExerciseDialog";
import EditExerciseDialog from "@/components/exercises/EditExerciseDialog";
import ExercisesTable from "@/components/exercises/ExercisesTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  user_id: string | null;
};

export default function ExercisesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState<null | Exercise>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleBackClick = () => {
    navigate(-1);
  };

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
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick}
            type="button"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Ejercicios</h1>
        </div>
        <CreateExerciseDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ["exercises"] })}
        />
      </div>
      <Card>
        <CardContent className="pt-6">
          {query.isLoading ? (
            <div>Cargando ejercicios...</div>
          ) : query.isError ? (
            <div className="text-destructive">Error: {(query.error as Error).message}</div>
          ) : (
            <ExercisesTable
              exercises={query.data ?? []}
              onEdit={setEditing}
              onDelete={(id) => deleteMutation.mutate(id)}
              loadingDelete={deleteMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
      <EditExerciseDialog
        open={!!editing}
        onOpenChange={(isOpen) => !isOpen && setEditing(null)}
        exercise={editing}
      />
    </div>
  );
}
