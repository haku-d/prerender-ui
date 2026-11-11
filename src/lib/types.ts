export interface DateRange {
  from: string; // ISO date string e.g. "2026-03-25"
  to: string;   // ISO date string e.g. "2026-04-01"
}

export interface BotCount {
  botName: string;
  count: number;
}

export interface CacheStatusCount {
  cacheStatus: string;
  count: number;
}

export interface ResponseStatusCount {
  responseStatus: number;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  uniquePages: number;
  byBot: BotCount[];
  byCacheStatus: CacheStatusCount[];
  byResponseStatus?: ResponseStatusCount[];
}

export interface PageEntry {
  path: string;
  count: number;
  lastRequestedAt: string;
}

export interface BotEntry {
  botName: string;
  count: number;
  lastRequestedAt: string;
}

export interface BotRequestEntry {
  requestedAt: string;
  path: string;
  cacheStatus: string;
  responseStatus: number;
  userAgent: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedBotRequests {
  data: BotRequestEntry[];
  pagination: Pagination;
  availableStatuses?: ResponseStatusCount[];
}

export interface AnalyticsRequestEntry extends BotRequestEntry {
  botName: string;
}

export interface PaginatedRequests {
  data: AnalyticsRequestEntry[];
  pagination: Pagination;
}
