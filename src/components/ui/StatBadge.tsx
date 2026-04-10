interface StatBadgeProps {
  label: string;
  value: number | string;
}

export function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-3xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
