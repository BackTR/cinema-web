interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

export function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </div>
  );
}