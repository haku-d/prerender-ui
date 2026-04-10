"use client";

import useSWR from "swr";
import { clientFetchSummary } from "@/lib/client-api";
import type { AnalyticsSummary } from "@/lib/types";

export function useSummary(from: string, to: string) {
  const key = from && to ? ["summary", from, to] : null;
  return useSWR<AnalyticsSummary>(key, () => clientFetchSummary(from, to));
}
