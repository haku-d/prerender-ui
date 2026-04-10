import type { AnalyticsSummary, PageEntry, BotEntry } from "./types";

async function clientFetch<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Request error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function clientFetchSummary(
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  return clientFetch<AnalyticsSummary>("/api/analytics/summary", { from, to });
}

export function clientFetchPages(
  from: string,
  to: string,
  limit: string = "50",
  bot: string = "",
): Promise<PageEntry[]> {
  return clientFetch<PageEntry[]>("/api/analytics/pages", {
    from,
    to,
    limit,
    bot,
  });
}

export function clientFetchBots(from: string, to: string): Promise<BotEntry[]> {
  return clientFetch<BotEntry[]>("/api/analytics/bots", { from, to });
}
