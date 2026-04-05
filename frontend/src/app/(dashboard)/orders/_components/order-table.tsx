"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/actions/order.actions";
import { toast } from "sonner";
import { ActionModal } from "@/components/shared/action-modal";
import { useState, useTransition } from "react";
import { Order } from "@/lib/types";

interface OrderTableProps {
  orders: Order[];
  userRole?: string;
}

export function OrderTable({ orders, userRole }: OrderTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      accessorKey: "_id",
      cell: (order) => (
        <span className="font-mono text-xs text-indigo-400">
          #{order._id.slice(-6).toUpperCase()}
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
      accessorKey: "created_at",
      cell: (order) => (
        <span className="text-slate-400">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(order.created_at))}
        </span>
      ),
    },
  ];

  if (userRole === "Admin") {
    columns.push({
      header: "Actions",
      accessorKey: "_id",
      cell: (order) => (
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()} // Prevent row click
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            onClick={() => setDeletingId(order._id)}
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
        data={orders}
        columns={columns}
        onRowClick={(order) => router.push(`/orders/${order._id}`)}
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
