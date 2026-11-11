"use client";

import { useRouter } from "next/navigation";
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
  from: string;
  to: string;
}

interface StatusTickProps {
  x?: number;
  y?: number;
  payload?: { value: number | string };
  onSelect: (status: number) => void;
}

function formatStatusLabel(value: number | string) {
  const status = Number(value);
  return STATUS_LABELS[status] ?? String(value);
}

function StatusTick({ x = 0, y = 0, payload, onSelect }: StatusTickProps) {
  if (!payload) return null;

  const status = Number(payload.value);
  const label = formatStatusLabel(payload.value);
  const navigate = () => onSelect(status);

  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      role="link"
      tabIndex={0}
      aria-label={`View requests with ${label}`}
      className="cursor-pointer fill-teal-800 underline outline-none focus-visible:fill-teal-950"
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
    >
      {label}
    </text>
  );
}

export function ResponseStatusChart({ data, from, to }: ResponseStatusChartProps) {
  const router = useRouter();

  function showRequests(status: number) {
    const params = new URLSearchParams({ from, to, status: String(status) });
    router.push(`/requests?${params.toString()}`);
  }

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
          tick={<StatusTick onSelect={showRequests} />}
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
