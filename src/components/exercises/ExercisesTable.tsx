
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Exercise {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  user_id: string | null;
}

interface ExercisesTableProps {
  exercises: Exercise[];
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
  loadingDelete?: boolean;
}

export default function ExercisesTable({ exercises, onEdit, onDelete, loadingDelete }: ExercisesTableProps) {
  const { user } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exercises && exercises.length > 0 ? (
          exercises.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell className="font-medium">{ex.name}</TableCell>
              <TableCell>{ex.type || "-"}</TableCell>
              <TableCell className="max-w-xs truncate" title={ex.description || ""}>
                {ex.description || "-"}
              </TableCell>
              <TableCell className="text-right">
                {ex.user_id === user?.id ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(ex)}>
                      <Pencil className="text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(ex.id)} disabled={loadingDelete}>
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
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No hay ejercicios registrados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
