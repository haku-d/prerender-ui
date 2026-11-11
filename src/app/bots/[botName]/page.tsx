import Link from "next/link";
import { format, isValid, parseISO, subDays } from "date-fns";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { fetchRecentBotRequests } from "@/lib/api";
import type { BotRequestEntry, PaginatedBotRequests } from "@/lib/types";

interface BotDetailsPageProps {
  params: Promise<{ botName: string }>;
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}

const COLUMNS: ColumnDef<BotRequestEntry>[] = [
  { key: "requestedAt", header: "Requested At", type: "date" },
  { key: "path", header: "Path", type: "text" },
  { key: "responseStatus", header: "Response", type: "number" },
  { key: "cacheStatus", header: "Cache Status", type: "text" },
];

function dateOrFallback(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value
    ? value
    : fallback;
}

function pageHref(botName: string, from: string, to: string, page: number) {
  const params = new URLSearchParams({ from, to, page: String(page) });
  return `/bots/${encodeURIComponent(botName)}?${params.toString()}`;
}

export default async function BotDetailsPage({
  params,
  searchParams,
}: BotDetailsPageProps) {
  const [{ botName }, filters] = await Promise.all([params, searchParams]);
  const today = new Date();
  const to = dateOrFallback(filters.to, format(today, "yyyy-MM-dd"));
  const from = dateOrFallback(
    filters.from,
    format(subDays(today, 6), "yyyy-MM-dd"),
  );
  const backParams = new URLSearchParams({ from, to });
  const requestedPage = Number(filters.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  let result: PaginatedBotRequests | null = null;
  let error: string | null = null;
  try {
    result = await fetchRecentBotRequests(botName, from, to, page);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/?${backParams.toString()}`}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{botName}</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Recent requests from {format(parseISO(from), "MMM d, yyyy")} to{" "}
          {format(parseISO(to), "MMM d, yyyy")}
        </p>
        {error ? (
          <ErrorMessage message={`Failed to load bot requests: ${error}`} />
        ) : result ? (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-700">
              Recent Requests ({result.pagination.total.toLocaleString()})
            </h2>
            <DataTable columns={COLUMNS} data={result.data} />
            {result.pagination.totalPages > 1 && (
              <nav
                aria-label="Request pagination"
                className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm"
              >
                <span className="text-gray-500">
                  Page {result.pagination.page} of {result.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  {result.pagination.page > 1 ? (
                    <Link
                      href={pageHref(botName, from, to, result.pagination.page - 1)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-400">
                      Previous
                    </span>
                  )}
                  {result.pagination.page < result.pagination.totalPages ? (
                    <Link
                      href={pageHref(botName, from, to, result.pagination.page + 1)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-400">
                      Next
                    </span>
                  )}
                </div>
              </nav>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
