import Link from "next/link";
import { format, isValid, parseISO, subDays } from "date-fns";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { fetchRequests } from "@/lib/api";
import type { AnalyticsRequestEntry, PaginatedRequests } from "@/lib/types";

interface RequestsPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    status?: string;
    page?: string;
  }>;
}

const HTTP_STATUS_LABELS: Record<number, string> = {
  200: "200 OK",
  201: "201 Created",
  202: "202 Accepted",
  204: "204 No Content",
  301: "301 Moved Permanently",
  302: "302 Found",
  304: "304 Not Modified",
  400: "400 Bad Request",
  401: "401 Unauthorized",
  403: "403 Forbidden",
  404: "404 Not Found",
  405: "405 Method Not Allowed",
  410: "410 Gone",
  429: "429 Too Many Requests",
  500: "500 Internal Server Error",
  502: "502 Bad Gateway",
  503: "503 Service Unavailable",
};

function dateOrFallback(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value
    ? value
    : fallback;
}

function parseStatus(value: string | undefined) {
  if (!value || !/^\d{3}$/.test(value)) return undefined;
  const status = Number(value);
  return status >= 100 && status <= 599 ? status : undefined;
}

function pageHref(from: string, to: string, status: number, page: number) {
  const params = new URLSearchParams({ from, to, status: String(status), page: String(page) });
  return `/requests?${params.toString()}`;
}

function requestStatusTone(status: number) {
  if (status >= 200 && status < 300) return "bg-green-50 text-green-700";
  if (status >= 300 && status < 400) return "bg-blue-50 text-blue-700";
  if (status >= 400 && status < 500) return "bg-amber-50 text-amber-800";
  if (status >= 500) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
}

const COLUMNS: ColumnDef<AnalyticsRequestEntry>[] = [
  { key: "requestedAt", header: "Requested At", type: "date" },
  { key: "botName", header: "Bot", type: "text" },
  { key: "path", header: "Path", type: "text" },
  {
    key: "responseStatus",
    header: "HTTP Status",
    type: "number",
    render: (request) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${requestStatusTone(request.responseStatus)}`}>
        {HTTP_STATUS_LABELS[request.responseStatus] ?? `${request.responseStatus} Status`}
      </span>
    ),
  },
  { key: "cacheStatus", header: "Cache Status", type: "text" },
  {
    key: "userAgent",
    header: "User Agent",
    render: (request) => (
      <span
        className="block max-w-xs truncate font-mono text-xs text-gray-600"
        title={request.userAgent}
      >
        {request.userAgent}
      </span>
    ),
  },
];

export default async function RequestsPage({
  searchParams,
}: RequestsPageProps) {
  const filters = await searchParams;
  const today = new Date();
  const to = dateOrFallback(filters.to, format(today, "yyyy-MM-dd"));
  const from = dateOrFallback(
    filters.from,
    format(subDays(today, 6), "yyyy-MM-dd"),
  );
  const status = parseStatus(filters.status);
  const requestedPage = Number(filters.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  let result: PaginatedRequests | null = null;
  let error: string | null = null;
  if (status === undefined) {
    error = "A valid HTTP status code is required.";
  } else {
    try {
      result = await fetchRequests(from, to, status, page);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
    }
  }

  const backParams = new URLSearchParams({ from, to });
  const statusLabel = status === undefined
    ? "HTTP Status"
    : HTTP_STATUS_LABELS[status] ?? `${status} Status`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/?${backParams.toString()}`}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Requests: {statusLabel}
        </h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          {format(parseISO(from), "MMM d, yyyy")} – {format(parseISO(to), "MMM d, yyyy")}
        </p>
        {error ? (
          <ErrorMessage message={`Failed to load requests: ${error}`} />
        ) : result ? (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-700">
              Recent Requests ({result.pagination.total.toLocaleString()})
            </h2>
            <DataTable columns={COLUMNS} data={result.data} />
            {result.pagination.totalPages > 1 && status !== undefined && (
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
                      href={pageHref(from, to, status, result.pagination.page - 1)}
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
                      href={pageHref(from, to, status, result.pagination.page + 1)}
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
