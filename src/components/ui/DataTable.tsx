import { format } from "date-fns";

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  type?: "text" | "number" | "date";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export function DataTable<T extends object>({
  columns,
  data,
}: DataTableProps<T>) {
  function renderCell(item: T, col: ColumnDef<T>) {
    const value = (item as Record<string | symbol, unknown>)[
      col.key as string | symbol
    ];
    if (value === null || value === undefined) return "—";
    if (col.type === "date" && typeof value === "string") {
      return format(new Date(value), "MMM d, yyyy HH:mm");
    }
    if (col.type === "number" && typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-3 py-2 text-gray-700 ${col.type === "number" ? "text-right tabular-nums" : ""}`}
                >
                  {renderCell(item, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">No data</p>
      )}
    </div>
  );
}
