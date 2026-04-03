import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Download, History } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activity Log"
        description="See recent system changes, orders, and user actions."
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </PageHeader>

      <EmptyState
        icon={<History />}
        title="No activity recorded"
        description="System activity and logs will appear here once you start using the inventory management features."
      />
    </div>
  );
}
