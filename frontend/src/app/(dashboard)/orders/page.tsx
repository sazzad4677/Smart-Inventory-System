import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Download, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        description="Monitor customer orders, status updates, and fulfillment."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </PageHeader>

      <EmptyState
        icon={<ShoppingCart />}
        title="No orders yet"
        description="You haven't received any orders yet. Once customers start buying, you'll see them here."
      />
    </div>
  );
}
