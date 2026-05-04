"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/actions/order.actions";
import { toast } from "sonner";
import { ActionModal } from "@/components/shared/action-modal";
import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Order } from "@/lib/types";
import { useSocket } from "@/hooks/use-socket";

interface OrderTableProps {
  orders: Order[];
  userRole?: string;
}

export function OrderTable({ orders, userRole }: OrderTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stateOrders, setStateOrders] = useState<Order[]>(orders);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const socket = useSocket();

  // Sync state with props when they change (pagination/filtering)
  useEffect(() => {
    setStateOrders(orders);
  }, [orders]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket?.current) return;
    const socketInstance = socket.current;

    const handleOrderCreated = (newOrder: Order) => {
      const page = searchParams.get("page") || "1";
      if (page !== "1") return;

      setStateOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        const updated = [newOrder, ...prev];
        const limit = parseInt(searchParams.get("limit") || "10");
        return updated.slice(0, limit);
      });
    };

    const handleOrderUpdated = (updatedOrder: Order) => {
      setStateOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      );
    };

    const handleOrderDeleted = (deletedId: string) => {
      setStateOrders((prev) => prev.filter((o) => o.id !== deletedId));
    };

    socketInstance.on("order_created", handleOrderCreated);
    socketInstance.on("order_updated", handleOrderUpdated);
    socketInstance.on("order_deleted", handleOrderDeleted);

    return () => {
      socketInstance.off("order_created", handleOrderCreated);
      socketInstance.off("order_updated", handleOrderUpdated);
      socketInstance.off("order_deleted", handleOrderDeleted);
    };
  }, [socket, searchParams]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteOrderAction(id);
      if (result.success) {
        toast.success("Order deleted successfully");
        setDeletingId(null);
      } else {
        toast.error(result.error || "Failed to delete order");
      }
    });
  };

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "order_id",
      cell: (order) => (
        <span className="font-mono text-xs text-indigo-400">
          {order.order_id}
        </span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
    },
    {
      header: "Total Price",
      accessorKey: "total_price",
      cell: (order) => (
        <span className="font-semibold text-white">
          ${order.total_price.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (order) => <StatusBadge status={order.status as StatusType} />,
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (order) => (
        <span className="text-slate-400">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(order.createdAt))}
        </span>
      ),
    },
  ];

  if (userRole === "Admin") {
    columns.push({
      header: "Actions",
      accessorKey: "id",
      cell: (order) => (
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()} // Prevent row click
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            onClick={() => setDeletingId(order.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <>
      <DataTable
        data={stateOrders}
        columns={columns}
        onRowClick={(order) => router.push(`/orders/${order.id}`)}
      />

      <ActionModal
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            onClick={() => setDeletingId(null)}
            disabled={isPending}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deletingId && handleDelete(deletingId)}
            disabled={isPending}
            className="!bg-rose-500 hover:!bg-rose-600 border-none shadow-lg shadow-rose-500/20"
          >
            {isPending ? "Deleting..." : "Delete Order"}
          </Button>
        </div>
      </ActionModal>
    </>
  );
}
