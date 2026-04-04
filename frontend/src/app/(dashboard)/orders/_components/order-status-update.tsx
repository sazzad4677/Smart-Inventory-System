"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "@/actions/order.actions";
import { toast } from "sonner";
import { AppSelect } from "@/components/shared/app-select";
import { OrderStatus, OrderStatusType } from "@/lib/validations";
import { Loader2 } from "lucide-react";

interface OrderDetailsClientProps {
  orderId: string;
  currentStatus: OrderStatusType;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: OrderDetailsClientProps) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<OrderStatusType>(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    const typedStatus = newStatus as OrderStatusType;
    setIsPending(true);
    try {
      const result = await updateOrderStatusAction(orderId, typedStatus);
      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setStatus(typedStatus);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const statusOptions = Object.values(OrderStatus).map((s) => ({
    label: s,
    value: s,
  }));

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">Update Status:</span>
      <div className="relative">
        <AppSelect
          options={statusOptions}
          value={status}
          onValueChange={handleStatusChange}
          triggerClassName="w-[180px] bg-slate-900 border-white/10"
        />
        {isPending && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          </div>
        )}
      </div>
    </div>
  );
}
