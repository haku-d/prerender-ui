"use client";

import useSWR from "swr";
import { clientFetchBots } from "@/lib/client-api";
import type { BotEntry } from "@/lib/types";

export function useBots(from: string, to: string) {
  const key = from && to ? ["bots", from, to] : null;
  return useSWR<BotEntry[]>(key, () => clientFetchBots(from, to));
}
