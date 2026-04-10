"use client";

import { useState } from "react";
import { usePages } from "@/hooks/usePages";
import { useSummary } from "@/hooks/useSummary";
import { Card } from "@/components/ui/Card";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { PageEntry } from "@/lib/types";

const COLUMNS: ColumnDef<PageEntry>[] = [
  { key: "path", header: "Page Path", type: "text" },
  { key: "count", header: "Hits", type: "number" },
  { key: "lastRequestedAt", header: "Last Requested", type: "date" },
];

const LIMIT_OPTIONS = ["50", "100", "500"];

interface TopPagesSectionProps {
  from: string;
  to: string;
}

export function TopPagesSection({ from, to }: TopPagesSectionProps) {
  const [limit, setLimit] = useState("50");
  const [bot, setBot] = useState("");

  const { data: summary } = useSummary(from, to);
  const { data, isLoading, error } = usePages(from, to, limit, bot);

  const botOptions = summary?.byBot.map((b) => b.botName) ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex-1">
          Top Pages
        </h2>

        <select
          value={bot}
          onChange={(e) => setBot(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All bots</option>
          {botOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LIMIT_OPTIONS.map((l) => (
            <option key={l} value={l}>
              Top {l}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={`Failed to load pages: ${error.message}`} />
        ) : (
          <DataTable columns={COLUMNS} data={data ?? []} />
        )}
      </Card>
    </section>
  );
}
