import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getOrdersAction } from "@/actions/order.actions";
import { OrderTable } from "./_components/order-table";
import { AddOrderDialog } from "./_components/add-order-dialog";
import { OrderFilters } from "./_components/order-filters";
import { Pagination } from "@/components/shared/pagination";
import { getCurrentUser } from "@/actions/auth.actions";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  const { page = "1", limit = "10", status, startDate, endDate } = params;

  const { data, meta } = await getOrdersAction({
    page,
    limit,
    status,
    startDate,
    endDate,
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Orders"
        description="Monitor customer orders, status updates, and fulfillment."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-slate-300 rounded-xl"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddOrderDialog />
        </div>
      </PageHeader>

      <OrderFilters />

      {data.length > 0 ? (
        <div className="flex flex-col gap-6">
          <OrderTable orders={data} userRole={user?.role} />
          <Pagination meta={meta} />
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12 text-slate-500" />}
          title="No orders yet"
          description="You haven't received any orders yet. Once customers start buying, you'll see them here."
        />
      )}
    </div>
  );
}
