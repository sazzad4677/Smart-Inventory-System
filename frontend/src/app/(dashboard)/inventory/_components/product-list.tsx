"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";
import { ProductActions } from "./product-actions";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { bulkDeleteProductsAction } from "@/actions/product.actions";
import { toast } from "sonner";
import { ActionModal } from "@/components/shared/action-modal";
import { Input } from "@/components/ui/input";

const getProductStatus = (stock: number, threshold: number): StatusType => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= threshold) return "Restock Queue";
  return "In Stock";
};

interface ProductListProps {
  products: Product[];
  categoryOptions: { label: string; value: string }[];
  userRole?: string;
}

export function ProductList({
  products,
  categoryOptions,
  userRole,
}: ProductListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteProductsAction(selectedIds);
      if (result.success) {
        toast.success(`Successfully deleted ${selectedIds.length} products`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(result.error || "Failed to delete products");
      }
    });
  };

  const allColumns: Column<Product>[] = [
    {
      header: "Select",
      headerClassName: "w-[50px]",
      cell: (product) => (
        <Input
          type="checkbox"
          className="!h-4 !w-4 !p-0 rounded border border-white/10 bg-slate-900/50 accent-indigo-600 transition-all cursor-pointer hover:border-indigo-500/20 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0"
          checked={selectedIds.includes(product._id)}
          onChange={(e) => handleSelectOne(product._id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      header: "ID",
      accessorKey: "product_id",
      className: "font-mono text-[10px] text-indigo-400/70",
    },
    {
      header: "Name",
      accessorKey: "name",
      className: "font-semibold text-slate-100",
    },
    {
      header: "Category",
      cell: (product) => {
        const categoryName =
          typeof product.category_id === "object"
            ? (product.category_id as { name: string }).name
            : "N/A";
        return <span className="text-slate-400">{categoryName}</span>;
      },
    },
    {
      header: "Price",
      cell: (product) => (
        <span className="text-indigo-400 font-semibold">
          $
          {product.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: "Stock",
      cell: (product) => (
        <span
          className={cn(
            "font-medium transition-colors",
            product.stock_quantity <= 0
              ? "text-rose-500"
              : product.stock_quantity <= product.min_threshold
                ? "text-amber-400"
                : "text-slate-300",
          )}
        >
          {product.stock_quantity}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (product) => (
        <StatusBadge
          status={getProductStatus(
            product.stock_quantity,
            product.min_threshold,
          )}
        />
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (product) => (
        <ProductActions
          product={product}
          categoryOptions={categoryOptions}
          userRole={userRole}
        />
      ),
    },
  ];

  const columns = allColumns.filter((col) => {
    if (userRole === "Staff") {
      return col.header !== "Select" && col.header !== "Actions";
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {userRole !== "Staff" && (
        <div className="flex items-center justify-between px-2 h-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="checkbox"
                className="!h-4 !w-4 !p-0 rounded border border-white/10 bg-slate-900/50 accent-indigo-600 transition-all cursor-pointer hover:border-indigo-500/20 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0"
                checked={
                  products.length > 0 && selectedIds.length === products.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {selectedIds.length > 0
                  ? `${selectedIds.length} Selected`
                  : "Select All"}
              </span>
            </div>

            {selectedIds.length > 0 && userRole === "Admin" && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 bg-rose-500/80 hover:bg-rose-500 text-rose-500 border border-rose-500/20 transition-all font-semibold px-3"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      <DataTable data={products} columns={columns} />

      <ActionModal
        isOpen={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Multiple Products"
        description={`Are you sure you want to delete ${selectedIds.length} products? This action will remove them from the active inventory list.`}
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            onClick={() => setIsBulkDeleteOpen(false)}
            disabled={isPending}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isPending}
            className="!bg-rose-500 hover:!bg-rose-600 border-none shadow-lg shadow-rose-500/20"
          >
            {isPending ? "Deleting..." : "Delete All Selected"}
          </Button>
        </div>
      </ActionModal>
    </div>
  );
}
