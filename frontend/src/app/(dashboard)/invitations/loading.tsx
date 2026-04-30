import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 mb-4">
        <Skeleton className="h-8 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
