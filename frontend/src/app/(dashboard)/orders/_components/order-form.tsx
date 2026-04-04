"use client";

import { useTransition, useMemo } from "react";
import { OrderSchema, OrderInput } from "@/lib/validations";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { OrderItemsField } from "./order-items-field";
import { createOrderAction } from "@/actions/order.actions";
import { toast } from "sonner";
import { User } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface OrderFormProps {
  products: Product[];
  onSuccess: () => void;
}

export function OrderForm({ products, onSuccess }: OrderFormProps) {
  const [isPending, startTransition] = useTransition();

  const fields: FieldConfig<OrderInput>[] = [
    {
      name: "customer_name",
      label: "Customer Name",
      type: "text",
      placeholder: "e.g., John Doe",
      icon: User,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: "items" as any, // items is an array, DynamicForm handles it via custom render
      label: "",
      type: "custom",
      render: (form) => <OrderItemsField form={form} products={products} />,
    },
  ];

  // Create a dynamic schema that knows about the current stock levels
  const dynamicSchema = useMemo(() => {
    return OrderSchema.superRefine((data, ctx) => {
      data.items.forEach((item, index) => {
        const product = products.find((p) => p._id === item.product_id);
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
  }, [products]);

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
