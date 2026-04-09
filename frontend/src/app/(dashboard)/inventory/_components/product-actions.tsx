"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { EditProductDialog } from "./edit-product-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";

interface ProductActionsProps {
  product: Product;
  categoryOptions: { label: string; value: string }[];
  userRole?: string;
}

export function ProductActions({
  product,
  categoryOptions,
  userRole,
}: ProductActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Restrict actions to Admin and Manager
  if (userRole !== "Admin" && userRole !== "Manager") return null;

  return (
    <div
      className="flex justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <EditProductDialog
        product={product}
        categoryOptions={categoryOptions}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteProductDialog
        product={product}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </div>
  );
}
