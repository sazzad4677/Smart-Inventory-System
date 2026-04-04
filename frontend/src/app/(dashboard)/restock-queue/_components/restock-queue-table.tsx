"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { RestockModal } from "./restock-modal";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowUpCircle, Info } from "lucide-react";

interface RestockItem {
  _id: string;
  name: string;
  stock_quantity: number;
  min_threshold: number;
  priority: "High" | "Medium" | "Low";
}

interface RestockQueueTableProps {
  data: RestockItem[];
}

export function RestockQueueTable({ data }: RestockQueueTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<RestockItem | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRestock = (product: RestockItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const columns: Column<RestockItem>[] = [
    {
      header: "Product Name",
      accessorKey: "name",
      className: "font-semibold text-white",
    },
    {
      header: "Current Stock",
      cell: (item) => (
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              item.stock_quantity === 0
                ? "bg-rose-500 animate-pulse"
                : "bg-amber-500",
            )}
          />
          {item.stock_quantity}
        </span>
      ),
    },
    {
      header: "Min Threshold",
      accessorKey: "min_threshold",
    },
    {
      header: "Priority",
      cell: (item) => {
        const config = {
          High: {
            color:
              "border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-rose-500/20",
            icon: <AlertCircle className="h-3 w-3 mr-1.5" />,
          },
          Medium: {
            color:
              "border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-amber-500/20",
            icon: <Info className="h-3 w-3 mr-1.5" />,
          },
          Low: {
            color:
              "border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-blue-500/20",
            icon: <ArrowUpCircle className="h-3 w-3 mr-1.5" />,
          },
        };

        const { color, icon } = config[item.priority];

        return (
          <div
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_-3px]",
              color,
            )}
          >
            {icon}
            {item.priority}
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: (item) => (
        <Button
          onClick={() => handleRestock(item)}
          size="sm"
          className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 rounded-lg transition-all h-8 px-4"
        >
          Restock
        </Button>
      ),
      className: "text-right",
      headerClassName: "text-right",
    },
  ];

  return (
    <>
      <DataTable data={data} columns={columns} />
      {selectedProduct && (
        <RestockModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
