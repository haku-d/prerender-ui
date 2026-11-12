import Link from "next/link";
import { format, isValid, parseISO, subDays } from "date-fns";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { fetchRecentBotRequests } from "@/lib/api";
import type { BotRequestEntry, PaginatedBotRequests } from "@/lib/types";
import { ReclassifyUnknownBotsButton } from "./ReclassifyUnknownBotsButton";

interface BotDetailsPageProps {
  params: Promise<{ botName: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    page?: string;
    status?: string;
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

const CACHE_STATUS_LABELS: Record<string, string> = {
  hit: "Cache hit",
  miss: "Cache miss",
  expired: "Expired",
  gone: "Gone",
  redirect: "Redirect",
  "redirect-pattern": "Pattern redirect",
};

function statusTone(code: number) {
  if (code >= 200 && code < 300) return "bg-green-50 text-green-700";
  if (code >= 300 && code < 400) return "bg-blue-50 text-blue-700";
  if (code >= 400 && code < 500) return "bg-amber-50 text-amber-800";
  if (code >= 500) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function cacheStatusTone(status: string) {
  if (status === "hit") return "bg-green-50 text-green-700";
  if (status === "miss") return "bg-orange-50 text-orange-800";
  if (status === "expired") return "bg-amber-50 text-amber-800";
  if (status === "gone") return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
}

const COLUMNS: ColumnDef<BotRequestEntry>[] = [
  {
    key: "requestedAt",
    header: "Requested At",
    type: "date",
    width: "16%",
    render: (request) => format(parseISO(request.requestedAt), "yyyy-MM-dd HH:mm"),
  },
  {
    key: "path",
    header: "Path",
    width: "24%",
    render: (request) => (
      <span className="block truncate" title={request.path}>
        {request.path}
      </span>
    ),
  },
  {
    key: "responseStatus",
    header: "HTTP Status",
    type: "number",
    align: "center",
    width: "18%",
    render: (request) => (
      <div className="flex w-full justify-center">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(request.responseStatus)}`}>
          {request.responseStatus}
        </span>
      </div>
    ),
  },
  {
    key: "cacheStatus",
    header: "Cache Status",
    width: "17%",
    render: (request) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cacheStatusTone(request.cacheStatus)}`}>
        {CACHE_STATUS_LABELS[request.cacheStatus] ?? request.cacheStatus}
      </span>
    ),
  },
  {
    key: "userAgent",
    header: "User Agent",
    width: "25%",
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

function dateOrFallback(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value
    ? value
    : fallback;
}

function decodeBotName(botName: string) {
  try {
    return decodeURIComponent(botName);
  } catch {
    return botName;
  }
}

function statusFilter(value: string | undefined) {
  if (!value || !/^\d{3}$/.test(value)) return undefined;
  const status = Number(value);
  return status >= 100 && status <= 599 ? status : undefined;
}

function pageHref(
  botName: string,
  from: string,
  to: string,
  page: number,
  status?: number,
) {
  const params = new URLSearchParams({ from, to, page: String(page) });
  if (status !== undefined) params.set("status", String(status));
  return `/bots/${encodeURIComponent(botName)}?${params.toString()}`;
}

export default async function BotDetailsPage({
  params,
  searchParams,
}: BotDetailsPageProps) {
  const [{ botName: routeBotName }, filters] = await Promise.all([
    params,
    searchParams,
  ]);
  const botName = decodeBotName(routeBotName);
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
  const status = statusFilter(filters.status);

  let result: PaginatedBotRequests | null = null;
  let error: string | null = null;
  try {
    result = await fetchRecentBotRequests(botName, from, to, page, 50, status);
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
        {botName === "Unknown Bot" && <ReclassifyUnknownBotsButton />}
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
            <form
              action={`/bots/${encodeURIComponent(botName)}`}
              method="get"
              className="mb-4 rounded-lg bg-gray-50 p-3"
            >
              <input type="hidden" name="from" value={from} />
              <input type="hidden" name="to" value={to} />
              <fieldset>
                <legend className="mb-2 text-xs font-medium text-gray-600">
                  Filter by HTTP status
                </legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    name="status"
                    value=""
                    aria-pressed={status === undefined}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${status === undefined ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
                  >
                    All statuses
                  </button>
                  {(result.availableStatuses ?? []).map((option) => {
                    const isSelected = status === option.responseStatus;
                    const label =
                      HTTP_STATUS_LABELS[option.responseStatus] ??
                      `${option.responseStatus} Status`;
                    return (
                      <button
                        key={option.responseStatus}
                        type="submit"
                        name="status"
                        value={isSelected ? "" : String(option.responseStatus)}
                        aria-pressed={isSelected}
                        title={`${label}: ${option.count.toLocaleString()} requests`}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${isSelected ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
                      >
                        {option.responseStatus}
                        <span className="ml-1 text-xs opacity-80">
                          {option.count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </form>
            <DataTable
              columns={COLUMNS}
              data={result.data}
              tableClassName="w-full table-fixed"
              containerClassName="overflow-hidden"
            />
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
                      href={pageHref(botName, from, to, result.pagination.page - 1, status)}
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
                      href={pageHref(botName, from, to, result.pagination.page + 1, status)}
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
