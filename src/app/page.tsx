import { Suspense } from "react";
import { format, subDays } from "date-fns";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { SummarySection } from "@/components/dashboard/SummarySection";
import { TopPagesSection } from "@/components/dashboard/TopPagesSection";
import { BotsSection } from "@/components/dashboard/BotsSection";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SearchParams {
  from?: string;
  to?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const today = new Date();
  const to = params.to ?? format(today, "yyyy-MM-dd");
  const from = params.from ?? format(subDays(today, 6), "yyyy-MM-dd");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Prerender Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor bot requests, cache performance, and top pages
            </p>
          </div>
          <Suspense>
            <DateRangeFilter from={from} to={to} />
          </Suspense>
        </div>

        {/* Dashboard sections */}
        <div className="flex flex-col gap-8">
          <Suspense fallback={<LoadingSpinner />}>
            <SummarySection from={from} to={to} />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <TopPagesSection from={from} to={to} />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <BotsSection from={from} to={to} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
