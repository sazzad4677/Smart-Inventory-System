import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { getOrdersAction } from "@/actions/order.actions";
import { OrderTable } from "./_components/order-table";
import { AddOrderDialog } from "./_components/add-order-dialog";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { OrderStatus } from "@/lib/validations";
import { Pagination } from "@/components/shared/pagination";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getCurrentUser } from "@/actions/auth.actions";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);

  const {
    page = "1",
    limit = "10",
    status,
    startDate,
    endDate,
    searchTerm,
  } = params;

  const ordersPromise = getOrdersAction({
    page,
    limit,
    status,
    startDate,
    endDate,
    searchTerm,
  });

  const filters: FilterField[] = [
    {
      key: "searchTerm",
      label: "Search",
      type: "search",
      placeholder: "Search orders...",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "All Statuses", value: "all" },
        ...Object.values(OrderStatus).map((s) => ({ label: s, value: s })),
      ],
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
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

      <FilterBar filters={filters} />

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTableAsync promise={ordersPromise} userRole={user?.role} />
      </Suspense>
    </div>
  );
}

async function OrdersTableAsync({
  promise,
  userRole,
}: {
  promise: ReturnType<typeof getOrdersAction>;
  userRole?: string;
}) {
  const result = await promise;

  if (!result.success) {
    return (
      <ErrorAlert
        error={result.error || "Failed to load orders. Please try again later."}
      />
    );
  }

  const data = result.data.data;
  const meta = result.data.meta;

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-12 w-12 text-slate-500" />}
        title="No orders yet"
        description="You haven't received any orders yet. Once customers start buying, you'll see them here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OrderTable orders={data} userRole={userRole} />
      <Pagination meta={meta} itemLabel="orders" />
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 min-h-[400px]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-white/5" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
