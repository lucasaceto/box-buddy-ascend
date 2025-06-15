
import { format } from "date-fns";

type ActivityItem = {
  title: string;
  detail: string;
  date?: string | null;
};

export function ActivityFeed({
  activities = [],
  loading,
}: {
  activities: ActivityItem[];
  loading: boolean;
}) {
  return (
    <section className="bg-white flex-1 shadow-lg rounded-xl p-6 overflow-auto animate-fade-in min-w-0">
      <h2 className="text-lg font-semibold mb-4 text-primary">Actividad Reciente</h2>
      {loading ? (
        <div className="text-blue-400">Cargando actividad...</div>
      ) : activities.length === 0 ? (
        <div className="text-sm text-muted-foreground">Aún no se registran actividades.</div>
      ) : (
        <ul>
          {activities.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-2 border-b border-blue-50 last:border-b-0">
              <span className="font-bold text-blue-900">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.detail}</span>
              <span className="ml-auto text-xs text-blue-400">
                {item.date ? format(new Date(item.date), "dd MMM HH:mm") : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
