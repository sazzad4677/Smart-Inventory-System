"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  category_id: {
    _id: string;
    name: string;
  };
  price: number;
  stock_quantity: number;
  min_threshold: number;
  status: string;
}

const getProductStatus = (stock: number, threshold: number): StatusType => {
  if (stock <= 0) return "Out of Stock";
  if (stock <= threshold) return "Restock Queue";
  return "In Stock";
};

const columns: Column<Product>[] = [
  {
    header: "Name",
    accessorKey: "name",
    className: "font-semibold text-slate-100",
  },
  {
    header: "Category",
    cell: (product) => {
      const categoryName = product.category_id?.name || "N/A";
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
    header: "Min Threshold",
    accessorKey: "min_threshold",
    className: "text-slate-500",
  },
  {
    header: "Status",
    headerClassName: "text-right",
    className: "text-right",
    cell: (product) => (
      <StatusBadge
        status={getProductStatus(product.stock_quantity, product.min_threshold)}
      />
    ),
  },
];

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return <DataTable data={products} columns={columns} />;
}
