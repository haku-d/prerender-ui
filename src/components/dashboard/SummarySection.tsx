"use client";

import { useSummary } from "@/hooks/useSummary";
import { Card } from "@/components/ui/Card";
import { StatBadge } from "@/components/ui/StatBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BotBreakdownChart } from "@/components/charts/BotBreakdownChart";
import { CacheStatusChart } from "@/components/charts/CacheStatusChart";
import { ResponseStatusChart } from "@/components/charts/ResponseStatusChart";

interface SummarySectionProps {
  from: string;
  to: string;
}

export function SummarySection({ from, to }: SummarySectionProps) {
  const { data, isLoading, error } = useSummary(from, to);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage message={`Failed to load summary: ${error.message}`} />
    );
  if (!data) return null;

  const responseStatuses = data.byResponseStatus ?? [];

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <StatBadge label="Total Requests" value={data.total} />
        </Card>
        <Card>
          <StatBadge label="Unique Pages" value={data.uniquePages} />
        </Card>
        <Card title="Cache Status" className="sm:col-span-2 xl:col-span-1">
          {data.byCacheStatus.length > 0 ? (
            <CacheStatusChart data={data.byCacheStatus} />
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </Card>
        <Card title="Requests by Response Status" className="sm:col-span-2 xl:col-span-1">
          {responseStatuses.length > 0 ? (
            <ResponseStatusChart data={responseStatuses} />
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </Card>
      </div>
    </section>
  );
}
