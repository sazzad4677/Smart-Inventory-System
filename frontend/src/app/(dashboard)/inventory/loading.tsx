import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inventory"
        description="Manage your products, stock levels, and pricing."
      >
        <div className="h-11 w-36 bg-slate-800/50 rounded-xl animate-pulse" />
      </PageHeader>

      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="h-11 w-full xl:max-w-xs bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="h-11 w-full sm:w-[220px] bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="h-11 w-full sm:w-[160px] bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="relative group mt-4">
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
