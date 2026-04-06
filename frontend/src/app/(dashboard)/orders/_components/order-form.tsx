"use client";

import { useTransition, useMemo, useState, useCallback } from "react";
import { OrderSchema, OrderInput } from "@/lib/validations";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { OrderItemsField } from "./order-items-field";
import { createOrderAction } from "@/actions/order.actions";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { User } from "lucide-react";

interface OrderFormProps {
  onSuccess: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedProductsMap, setSelectedProductsMap] = useState<
    Record<string, Product>
  >({});

  const handleProductsLoaded = useCallback((products: Product[]) => {
    setSelectedProductsMap((prev) => {
      const newMap = { ...prev };
      products.forEach((p) => {
        newMap[p._id] = p;
      });
      return newMap;
    });
  }, []);

  const fields: FieldConfig<OrderInput>[] = [
    {
      name: "customer_name",
      label: "Customer Name",
      type: "text",
      placeholder: "e.g., John Doe",
      icon: User,
    },
    {
      name: "items",
      label: "",
      type: "custom",
      render: (form) => (
        <OrderItemsField
          form={form}
          onProductsLoaded={handleProductsLoaded}
          selectedProductsMap={selectedProductsMap}
        />
      ),
    },
  ];

  // Create a dynamic schema that knows about the current stock levels from our local map
  const dynamicSchema = useMemo(() => {
    return OrderSchema.superRefine((data, ctx) => {
      data.items.forEach((item, index) => {
        const product = selectedProductsMap[item.product_id];
        if (product) {
          if (Number(item.quantity) > product.stock_quantity) {
            ctx.addIssue({
              code: "custom",
              message: "Exceeds available stock",
              path: ["items", index, "quantity"],
            });
          }
        }
      });
    });
  }, [selectedProductsMap]);

  const onSubmit = (data: OrderInput) => {
    startTransition(async () => {
      const result = await createOrderAction(data);
      if (result.success) {
        toast.success("Order created successfully");
        onSuccess();
      } else {
        toast.error(result.error || "Failed to create order");
      }
    });
  };

  return (
    <DynamicForm
      schema={dynamicSchema}
      defaultValues={{
        customer_name: "",
        items: [{ product_id: "", quantity: 1 }],
      }}
      fields={fields}
      onSubmit={onSubmit}
      submitText="Create Order"
      isPending={isPending}
    />
  );
}
