"use client";

import { useTransition } from "react";
import { ActionModal } from "@/components/shared/action-modal";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { ProductSchema, ProductInput } from "@/lib/validations";
import { updateProductAction } from "@/actions/product.actions";
import { toast } from "sonner";
import { Product } from "@/lib/types";

interface EditProductDialogProps {
  product: Product;
  categoryOptions: { label: string; value: string }[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  categoryOptions,
  isOpen,
  onOpenChange,
}: EditProductDialogProps) {
  const [isPending, startTransition] = useTransition();

  const fields: FieldConfig<ProductInput>[] = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "e.g., Wireless Mouse",
      autoComplete: "off",
    },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      placeholder: "Select category",
      options: categoryOptions,
    },
    {
      name: "price",
      label: "Price ($)",
      type: "number",
      placeholder: "0.00",
    },
    {
      name: "stock_quantity",
      label: "Current Stock",
      type: "number",
      placeholder: "0",
    },
    {
      name: "min_threshold",
      label: "Low Stock Threshold",
      type: "number",
      placeholder: "5",
    },
  ];

  const onSubmit = (data: ProductInput) => {
    startTransition(async () => {
      const result = await updateProductAction(product.id, data);
      if (result.success) {
        onOpenChange(false);
        toast.success("Product updated successfully");
      } else {
        toast.error(result.error || "Failed to update product");
      }
    });
  };

  const categoryId = product.category?.id || product.category_id;

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Product"
      description="Update the product details below."
    >
      <DynamicForm
        schema={ProductSchema}
        defaultValues={{
          name: product.name,
          category_id: categoryId,
          price: product.price,
          stock_quantity: product.stock_quantity,
          min_threshold: product.min_threshold,
        }}
        fields={fields}
        onSubmit={onSubmit}
        submitText="Update Product"
        isPending={isPending}
      />
    </ActionModal>
  );
}
