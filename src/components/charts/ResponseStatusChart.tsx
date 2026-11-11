"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ResponseStatusCount } from "@/lib/types";

const STATUS_LABELS: Record<number, string> = {
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

interface ResponseStatusChartProps {
  data: ResponseStatusCount[];
}

function formatStatusLabel(value: number | string) {
  const status = Number(value);
  return STATUS_LABELS[status] ?? String(value);
}

export function ResponseStatusChart({ data }: ResponseStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 32, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="responseStatus"
          width={150}
          tickFormatter={formatStatusLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          labelFormatter={(label) => formatStatusLabel(String(label))}
          formatter={(value) =>
            typeof value === "number" ? value.toLocaleString() : String(value)
          }
        />
        <Bar dataKey="count" name="Requests" fill="#0f766e" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="count"
            position="right"
            formatter={(value) =>
              typeof value === "number" ? value.toLocaleString() : String(value)
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
