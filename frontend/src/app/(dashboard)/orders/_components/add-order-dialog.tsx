"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/shared/action-modal";
import { OrderForm } from "./order-form";

export function AddOrderDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ActionModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Create New Order"
      description="Enter customer details and select products to create a new order."
      trigger={
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 px-6 font-semibold h-11 rounded-xl active:scale-[0.98] transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      }
      className="sm:max-w-[600px]"
    >
      <div className="mt-4">
        <OrderForm onSuccess={() => setIsOpen(false)} />
      </div>
    </ActionModal>
  );
}
