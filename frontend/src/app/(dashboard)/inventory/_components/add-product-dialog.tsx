"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/shared/action-modal";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { ProductSchema, ProductInput } from "@/lib/validations";
import { createProductAction } from "@/actions/product.actions";
import { toast } from "sonner";

interface AddProductDialogProps {
  categoryOptions: { label: string; value: string }[];
}

export function AddProductDialog({ categoryOptions }: AddProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fields: FieldConfig<ProductInput>[] = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "e.g., Wireless Mouse",
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
      label: "Initial Stock",
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
      try {
        const result = await createProductAction(data);
        if (result.success) {
          setIsOpen(false);
          toast.success("Product added successfully");
        } else {
          toast.error(result.error || "Failed to add product");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Add New Product"
      description="Fill in the details below to add a new product to your inventory."
      trigger={
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 px-6 font-semibold h-11 rounded-xl active:scale-[0.98] transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      }
    >
      <DynamicForm
        schema={ProductSchema}
        defaultValues={{
          name: "",
          category_id: "",
          price: 0,
          stock_quantity: 0,
          min_threshold: 10,
        }}
        fields={fields}
        onSubmit={onSubmit}
        submitText="Add Product"
        isPending={isPending}
      />
    </ActionModal>
  );
}
