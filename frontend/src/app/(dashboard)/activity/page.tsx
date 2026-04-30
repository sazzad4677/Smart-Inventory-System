import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getActivityLogs } from "@/actions/activity.actions";
import { ActivityLogClient } from "./_components/activity-log-client";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getCurrentUser } from "@/actions/auth.actions";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ActivityPage({
  searchParams,
}: ActivityPageProps) {
  const [resolvedSearchParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Transform searchParams for the server action
  const queryParams: Record<string, string | number | undefined> = {};
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      queryParams[key] = value;
    }
  });

  const activityPromise = getActivityLogs(queryParams);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activity Log"
        description="Monitor system changes, user actions, and inventory updates in real-time."
      />

      <Suspense fallback={<ActivityLogSkeleton />}>
        <ActivityLogAsync promise={activityPromise} />
      </Suspense>
    </div>
  );
}

async function ActivityLogAsync({
  promise,
}: {
  promise: ReturnType<typeof getActivityLogs>;
}) {
  const result = await promise;

  if (!result.success) {
    return (
      <ErrorAlert
        error={
          result.error ||
          "Failed to load activity logs. Please try again later."
        }
      />
    );
  }

  return (
    <ActivityLogClient activities={result.data.data} meta={result.data.meta} />
  );
}

function ActivityLogSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 min-h-[400px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-white/5" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
