
type StatCard = {
  label: string;
  value: string;
  icon: React.ReactNode;
  desc: string;
};
export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 animate-fade-in">
      {cards.map((item) => (
        <div
          key={item.label}
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-start gap-3 ring-1 ring-blue-100 hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div>{item.icon}</div>
          <div>
            <span className="block text-sm text-muted-foreground">{item.label}</span>
            <span className="block text-xl font-bold text-primary">{item.value}</span>
          </div>
          <span className="text-xs text-blue-600">{item.desc}</span>
        </div>
      ))}
    </section>
  );
}
