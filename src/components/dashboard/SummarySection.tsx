"use client";

import { format, parseISO } from "date-fns";
import { useSummary } from "@/hooks/useSummary";
import { Card } from "@/components/ui/Card";
import { StatBadge } from "@/components/ui/StatBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
        <p className="text-sm text-gray-500">
          {format(parseISO(from), "MMM d, yyyy")} – {format(parseISO(to), "MMM d, yyyy")}
        </p>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <StatBadge label="Total Requests" value={data.total} />
        </Card>
        <Card>
          <StatBadge label="Unique Pages" value={data.uniquePages} />
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Cache Status">
          {data.byCacheStatus.length > 0 ? (
            <CacheStatusChart data={data.byCacheStatus} />
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </Card>
        <Card title="Requests by Response Status">
          {responseStatuses.length > 0 ? (
            <ResponseStatusChart data={responseStatuses} from={from} to={to} />
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </Card>
      </div>
    </section>
  );
}
