"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/shared/action-modal";
import { OrderForm } from "./order-form";
import { getProductsAction } from "@/actions/product.actions";

export function AddOrderDialog() {
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const result = await getProductsAction({ limit: 100 });
      // Filter only active products
      const activeProducts = result.data.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.status === "Active",
      );
      setProducts(activeProducts);
      setIsLoading(false);
    }
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium animate-pulse text-indigo-400/80">
              Fetching active products...
            </p>
          </div>
        ) : (
          <OrderForm products={products} onSuccess={() => setIsOpen(false)} />
        )}
      </div>
    </ActionModal>
  );
}
