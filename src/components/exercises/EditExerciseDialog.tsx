
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditExerciseForm from "./EditExerciseForm";

interface EditExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: any | null;
}

export default function EditExerciseDialog({ open, onOpenChange, exercise }: EditExerciseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ejercicio</DialogTitle>
        </DialogHeader>
        {exercise && <EditExerciseForm exercise={exercise} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
