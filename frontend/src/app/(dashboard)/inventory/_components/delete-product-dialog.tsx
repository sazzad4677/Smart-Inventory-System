"use client";

import { useTransition } from "react";
import { ActionModal } from "@/components/shared/action-modal";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/actions/product.actions";
import { toast } from "sonner";
import { Product } from "@/lib/types";

interface DeleteProductDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProductDialog({
  product,
  isOpen,
  onOpenChange,
}: DeleteProductDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(product._id);
      if (result.success) {
        onOpenChange(false);
        toast.success("Product deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    });
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Delete Product"
      description={`Are you sure you want to delete "${product.name}"? This will hide the product from your inventory but will remain in your logs.`}
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
          className="!bg-rose-500 hover:!bg-rose-600 border-none shadow-lg shadow-rose-500/20"
        >
          {isPending ? "Deleting..." : "Delete Product"}
        </Button>
      </div>
    </ActionModal>
  );
}
