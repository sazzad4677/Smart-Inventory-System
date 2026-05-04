"use client";

import { useTransition } from "react";
import { ActionModal } from "@/components/shared/action-modal";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { RestockSchema, RestockInput } from "@/lib/validations";
import { updateProductStockAction } from "@/actions/product.actions";
import { toast } from "sonner";

interface RestockModalProps {
  product: {
    _id: string;
    name: string;
    stock_quantity: number;
    min_threshold: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestock?: (id: string, amount: number) => Promise<void>;
}

export function RestockModal({
  product,
  isOpen,
  onOpenChange,
  onRestock,
}: RestockModalProps) {
  const [isPending, startTransition] = useTransition();

  const fields: FieldConfig<RestockInput>[] = [
    {
      name: "quantity_to_add",
      label: "Quantity to Add",
      type: "number",
      placeholder: "e.g., 50",
    },
  ];

  const onSubmit = (data: RestockInput) => {
    if (onRestock) {
      onRestock(product.id, data.quantity_to_add);
      onOpenChange(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProductStockAction(
          product.id,
          product.stock_quantity,
          data.quantity_to_add,
        );

        if (result.success) {
          onOpenChange(false);
          toast.success(`Successfully restocked ${product.name}`);
        } else {
          toast.error(result.error || "Failed to restock product");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Restock: ${product.name}`}
      description={`Add stock to ${product.name}. Current stock: ${product.stock_quantity}. Threshold: ${product.min_threshold}.`}
    >
      <div className="space-y-4 py-4">
        <DynamicForm
          schema={RestockSchema}
          defaultValues={{
            quantity_to_add: 0,
          }}
          fields={fields}
          onSubmit={onSubmit}
          submitText="Confirm Restock"
          isPending={isPending}
        />
      </div>
    </ActionModal>
  );
}
