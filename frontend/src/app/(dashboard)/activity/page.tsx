import { PageHeader } from "@/components/layout/page-header";
import { getActivityLogs } from "@/actions/activity.actions";
import { ActivityLogClient } from "./_components/activity-log-client";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getCurrentUser } from "@/actions/auth.actions";
import { redirect } from "next/navigation";

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

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  // Transform searchParams for the server action
  const queryParams: Record<string, string | number | undefined> = {};
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      queryParams[key] = value;
    }
  });

  const result = await getActivityLogs(queryParams);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activity Log"
        description="Monitor system changes, user actions, and inventory updates in real-time."
      />

      {!result.success ? (
        <ErrorAlert
          error={
            result.error ||
            "Failed to load activity logs. Please try again later."
          }
        />
      ) : (
        <ActivityLogClient
          activities={result.data.data}
          meta={result.data.meta}
        />
      )}
    </div>
  );
}
