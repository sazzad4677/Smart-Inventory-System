import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getRestockQueue } from "@/actions/restock.actions";
import { RestockClient } from "./_components/restock-client";
import { AlertCircle, ClipboardList } from "lucide-react";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Restock Queue | Smart Inventory",
  description: "Monitor and replenish low-stock items in your inventory",
};

import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";

interface RestockQueuePageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    searchTerm?: string;
  }>;
}

export default async function RestockQueuePage({
  searchParams,
}: RestockQueuePageProps) {
  const params = await searchParams;

  const restockPromise = getRestockQueue({
    page: params.page,
    limit: params.limit,
    searchTerm: params.searchTerm,
  });

  const filters: FilterField[] = [
    {
      key: "searchTerm",
      label: "Search",
      type: "search",
      placeholder: "Search products...",
    },
    {
      key: "limit",
      label: "Limit",
      type: "select",
      options: [
        { label: "10 per page", value: "10" },
        { label: "20 per page", value: "20" },
        { label: "50 per page", value: "50" },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Restock Queue"
        description="Monitor and replenish low-stock items. Items will automatically move out of the queue once restocked."
      />

      <FilterBar filters={filters} />

      <Suspense fallback={<RestockQueueSkeleton />}>
        <RestockQueueAsync
          promise={restockPromise}
          searchTerm={params.searchTerm}
        />
      </Suspense>
    </div>
  );
}

async function RestockQueueAsync({
  promise,
  searchTerm,
}: {
  promise: ReturnType<typeof getRestockQueue>;
  searchTerm?: string;
}) {
  const result = await promise;

  if (!result.success) {
    return (
      <div className="text-center text-rose-500 py-8">
        Failed to load restock queue.
      </div>
    );
  }

  const restockItems = result.data.data as Product[];
  const meta = result.data.meta;

  if (restockItems.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-white/10 bg-slate-900/10 backdrop-blur-sm shadow-2xl shadow-indigo-500/5 transition-all">
        <div className="rounded-2xl bg-emerald-500/10 p-5 mb-6 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <ClipboardList className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          All Items are Well-Stocked!
        </h2>
        <p className="text-slate-400 text-center max-w-sm leading-relaxed">
          There are currently no items below their minimum threshold.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 shadow-xl shadow-indigo-500/5 backdrop-blur-md">
        <AlertCircle className="h-5 w-5 text-indigo-400" />
        <p className="text-sm font-medium">
          <span className="font-bold text-white pr-2">{meta.total} items</span>
          require immediate attention based on their minimum thresholds.
        </p>
      </div>
      <RestockClient initialProducts={restockItems} />
      <Pagination meta={meta} itemLabel="products" />
    </div>
  );
}

function RestockQueueSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-14 w-full bg-indigo-500/10 rounded-2xl border border-indigo-500/10" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className="h-48 w-full rounded-2xl bg-white/5 border border-white/5"
          />
        ))}
      </div>
    </div>
  );
}
