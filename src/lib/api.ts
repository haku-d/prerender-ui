import "server-only";
import type {
  AnalyticsSummary,
  BotEntry,
  BotRequestEntry,
  PageEntry,
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
  const res = await fetch(url.toString());
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

export function fetchRecentBotRequests(
  botName: string,
  from: string,
  to: string,
  limit: string = "50",
): Promise<BotRequestEntry[]> {
  return apiFetch<BotRequestEntry[]>(
    `/analytics/bots/${encodeURIComponent(botName)}/requests`,
    { from, to, limit },
  );
}
