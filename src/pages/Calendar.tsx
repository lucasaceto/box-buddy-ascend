
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CalendarPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Próximamente verás tu calendario de entrenamientos.</p>
      </div>
    </div>
  );
}
