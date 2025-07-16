import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida.",
  }),
  workoutId: z.string().optional(),
  resultType: z.string({
    required_error: "El tipo de resultado es requerido.",
  }),
  score: z.string({
    required_error: "El resultado es requerido.",
  }).min(1, "El resultado no puede estar vacío"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const resultTypes = [
  { value: "For Time", label: "For Time" },
  { value: "AMRAP", label: "AMRAP" },
  { value: "Weight", label: "Weight" },
  { value: "Rounds+Reps", label: "Rounds + Reps" },
  { value: "Distance", label: "Distance" },
  { value: "Reps", label: "Reps" },
];

export default function LogWod() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      workoutId: "",
      resultType: "",
      score: "",
      notes: "",
    },
  });

  // Fetch user's workouts for the dropdown
  const { data: workouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("id, name, description")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para registrar un WOD.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("daily_wods")
        .insert({
          user_id: user.id,
          date: format(values.date, "yyyy-MM-dd"),
          workout_id: values.workoutId || null,
          result_type: values.resultType,
          score: values.score,
          notes: values.notes || null,
        });

      if (error) throw error;

      toast({
        title: "¡WOD registrado!",
        description: "Tu WOD ha sido guardado exitosamente.",
      });

      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Error saving WOD:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el WOD. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar WOD</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del WOD</CardTitle>
          <CardDescription>
            Registra tu Workout of the Day y mantén un seguimiento de tu progreso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del WOD</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workoutId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrenamiento (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un entrenamiento existente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workouts?.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id}>
                            {workout.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Resultado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de resultado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resultTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ej. 12:30, 25 rounds, 100kg, 15 rounds + 10 reps"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Añade cualquier comentario sobre tu WOD..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Registrar WOD"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}