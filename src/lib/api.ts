import "server-only";
import type {

  AnalyticsSummary,
  BotEntry,
  PageEntry,
  PaginatedBotRequests,
  PaginatedRequests,
} from "./types";

const baseUrl = process.env.API_BASE_URL ?? "";

async function apiFetch<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchSummary(
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/analytics/summary", { from, to });
}

export function fetchPages(
  from: string,
  to: string,
  limit: string = "50",
  bot: string = "",
): Promise<PageEntry[]> {
  return apiFetch<PageEntry[]>("/analytics/pages", { from, to, limit, bot });
}

export function fetchBots(from: string, to: string): Promise<BotEntry[]> {
  return apiFetch<BotEntry[]>("/analytics/bots", { from, to });
}

export function fetchRequests(
  from: string,
  to: string,
  status: number,
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedRequests> {
  return apiFetch<PaginatedRequests>("/analytics/requests", {
    from,
    to,
    status: String(status),
    page: String(page),
    limit: String(limit),
  });
}

export function fetchRecentBotRequests(
  botName: string,
  from: string,
  to: string,
  page: number = 1,
  limit: number = 50,
  status?: number,
): Promise<PaginatedBotRequests> {
  return apiFetch<PaginatedBotRequests>(
    `/analytics/bots/${encodeURIComponent(botName)}/requests`,
    {
      from,
      to,
      page: String(page),
      limit: String(limit),
      status: status === undefined ? "" : String(status),
    },
  );
}
