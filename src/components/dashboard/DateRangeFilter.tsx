"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, subDays } from "date-fns";
import type { DateRange as DRType } from "react-day-picker";
import "react-day-picker/style.css";

interface DateRangeFilterProps {
  from: string;
  to: string;
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [range, setRange] = useState<DRType>({
    from: new Date(from),
    to: new Date(to),
  });

  const applyRange = useCallback(
    (selected: DRType | undefined) => {
      if (!selected?.from || !selected?.to) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", format(selected.from, "yyyy-MM-dd"));
      params.set("to", format(selected.to, "yyyy-MM-dd"));
      router.push(`?${params.toString()}`);
      setOpen(false);
    },
    [router, searchParams],
  );

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {format(new Date(from), "MMM d, yyyy")} —{" "}
        {format(new Date(to), "MMM d, yyyy")}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 rounded-xl shadow-xl border border-gray-200 bg-white p-4 flex gap-4">
          <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
            {presets.map((p) => (
              <button
                key={p.days}
                onClick={() => {
                  const today = new Date();
                  const selected = {
                    from: subDays(today, p.days - 1),
                    to: today,
                  };
                  setRange(selected);
                  applyRange(selected);
                }}
                className="rounded-md px-3 py-1.5 text-sm text-left text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={(r) => {
                if (r) setRange(r);
                if (r?.from && r?.to) applyRange(r);
              }}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
