import { PageHeader } from "@/components/layout/page-header";
import { getRestockQueue } from "@/actions/restock.action";
import { RestockQueueTable } from "./_components/restock-queue-table";
import { AlertCircle, ClipboardList } from "lucide-react";

export const metadata = {
  title: "Restock Queue | Smart Inventory",
  description: "Monitor and replenish low-stock items in your inventory",
};

export default async function RestockQueuePage() {
  const result = await getRestockQueue();
  const restockItems = result.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Restock Queue"
        description="Monitor and replenish low-stock items. Items will automatically move out of the queue once restocked."
      />

      {restockItems.length === 0 ? (
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
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 shadow-xl shadow-indigo-500/5 backdrop-blur-md">
            <AlertCircle className="h-5 w-5 text-indigo-400" />
            <p className="text-sm font-medium">
              <span className="font-bold text-white pr-2">
                {restockItems.length} items
              </span>
              require immediate attention based on their minimum thresholds.
            </p>
          </div>
          <RestockQueueTable data={restockItems} />
        </div>
      )}
    </div>
  );
}
