import Link from "next/link";
import type { ReactNode } from "react";
import { format } from "date-fns";

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  type?: "text" | "number" | "date";
  href?: (item: T) => string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
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

  function renderContent(item: T, col: ColumnDef<T>) {
    return col.render ? col.render(item) : renderCell(item, col);
  }

  function alignmentClass(col: ColumnDef<T>) {
    const alignment = col.align ?? (col.type === "number" ? "right" : "left");
    const horizontalAlignment =
      alignment === "center"
        ? "text-center"
        : alignment === "right"
          ? "text-right"
          : "text-left";
    return `${horizontalAlignment} ${col.type === "number" ? "tabular-nums" : ""}`;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide ${alignmentClass(col)}`}
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
                  className={`px-3 py-2 text-gray-700 ${alignmentClass(col)}`}
                >
                  {col.href ? (
                    <Link
                      href={col.href(item)}
                      className="text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      {renderContent(item, col)}
                    </Link>
                  ) : (
                    renderContent(item, col)
                  )}
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
