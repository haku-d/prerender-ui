"use client";

import useSWR from "swr";
import { clientFetchPages } from "@/lib/client-api";
import type { PageEntry } from "@/lib/types";

export function usePages(from: string, to: string, limit: string, bot: string) {
  const key = from && to ? ["pages", from, to, limit, bot] : null;
  return useSWR<PageEntry[]>(key, () => clientFetchPages(from, to, limit, bot));
}
