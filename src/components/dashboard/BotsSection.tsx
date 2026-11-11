"use client";

import { useBots } from "@/hooks/useBots";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BotsChart } from "@/components/charts/BotsChart";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import type { BotEntry } from "@/lib/types";


interface BotsSectionProps {
  from: string;
  to: string;
}

export function BotsSection({ from, to }: BotsSectionProps) {
  const { data, isLoading, error } = useBots(from, to);
  const columns: ColumnDef<BotEntry>[] = [
    {
      key: "botName",
      header: "Bot",
      type: "text",
      href: (bot) => {
        const params = new URLSearchParams({ from, to });
        return `/bots/${encodeURIComponent(bot.botName)}?${params.toString()}`;
      },
    },
    { key: "count", header: "Requests", type: "number" },
    { key: "lastRequestedAt", header: "Last Seen", type: "date" },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <ErrorMessage message={`Failed to load bots: ${error.message}`} />;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Bots</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Requests by Bot">
          {data && data.length > 0 ? (
            <BotsChart data={data} />
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </Card>
        <Card title="Bot Details">
          <DataTable columns={columns} data={data ?? []} />
        </Card>
      </div>
    </section>
  );
}
