"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  customer_name: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();

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

  return (
    <DataTable
      data={orders}
      columns={columns}
      onRowClick={(order) => router.push(`/orders/${order._id}`)}
    />
  );
}
