import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Restock Queue"
        description="Monitor and replenish low-stock items. Items will automatically move out of the queue once restocked."
      >
        <div className="h-11 w-36 bg-slate-800/50 rounded-xl animate-pulse" />
      </PageHeader>

      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="h-11 w-full bg-slate-800/50 rounded-xl animate-pulse" />
      </div>

      <div className="relative group mt-2">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
