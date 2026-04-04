"use client";

import { Calendar } from "lucide-react";
import { DataTable, Column } from "@/components/shared/data-table";

interface Category {
  _id: string;
  name: string;
  createdAt: string;
}

const columns: Column<Category>[] = [
  {
    header: "Category Name",
    accessorKey: "name",
    className: "font-semibold text-slate-100",
  },
  {
    header: "Created Date",
    headerClassName: "text-right",
    className: "text-right font-medium",
    cell: (category) => (
      <div className="flex items-center justify-end gap-2 text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
        <span>
          {category.createdAt
            ? new Date(category.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </span>
      </div>
    ),
  },
];

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return <DataTable data={categories} columns={columns} />;
}
