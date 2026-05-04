"use client";

import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { OrderInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FormInputField } from "@/components/shared/form-input-field";
import { Product } from "@/lib/types";
import { getProductsAction } from "@/actions/product.actions";
import { useDebounce } from "@/hooks/use-debounce";

interface OrderItemsFieldProps {
  form: UseFormReturn<OrderInput>;
  onProductsLoaded?: (products: Product[]) => void;
  selectedProductsMap: Record<string, Product>;
}

export function OrderItemsField({
  form,
  onProductsLoaded,
  selectedProductsMap,
}: OrderItemsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = useWatch({
    control: form.control,
    name: "items",
    defaultValue: form.getValues("items"),
  });

  // Dynamic search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products when search term changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      const result = await getProductsAction({
        searchTerm: debouncedSearch,
        limit: 10,
      });

      if (result.success) {
        const activeProducts = (result.data.data || []).filter(
          (p: Product) => p.status === "Active",
        );
        setFetchedProducts(activeProducts);

        if (onProductsLoaded) {
          onProductsLoaded(activeProducts);
        }
      }
      setIsLoading(false);
    };

    fetchSearchResults();
  }, [debouncedSearch, onProductsLoaded]);

  const totalPrice = useMemo(() => {
    return (watchItems || []).reduce((acc, item) => {
      if (!item.product_id) return acc;
      const product = selectedProductsMap[item.product_id];
      if (product) {
        const qty = Number(item.quantity) || 0;
        return acc + product.price * qty;
      }
      return acc;
    }, 0);
  }, [watchItems, selectedProductsMap]);

  const selectedProductIds = (watchItems || []).map((item) => item.product_id);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Order Items
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ product_id: "", quantity: 1 })}
          className="h-8 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
        >
          <Plus className="mr-2 h-3 w-3" />
          Add Product
        </Button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {fields.map((field, index) => {
          const itemValue = watchItems?.[index];
          const currentProductId = itemValue?.product_id;
          const currentProduct = currentProductId
            ? selectedProductsMap[currentProductId]
            : undefined;
          const currentQuantity = Number(itemValue?.quantity || 0);

          const isInvalid =
            currentProduct &&
            (currentQuantity > currentProduct.stock_quantity ||
              currentProduct.stock_quantity === 0);

          const rowOptions = fetchedProducts.map((p: Product) => ({
            label: `${p.name} ($${p.price})`,
            value: p.id,
            disabled:
              selectedProductIds.includes(p.id) && p.id !== currentProductId,
          }));

          if (
            currentProduct &&
            !rowOptions.find((o) => o.value === currentProductId)
          ) {
            rowOptions.unshift({
              label: `${currentProduct.name} ($${currentProduct.price})`,
              value: currentProduct.id,
              disabled: false,
            });
          }

          return (
            <div
              key={field.id}
              className={cn(
                "grid grid-cols-12 gap-3 items-start bg-white/[0.02] p-3 rounded-xl border transition-all duration-300",
                isInvalid
                  ? "border-rose-500/40 bg-rose-500/[0.03] shadow-[0_0_15px_-5px_rgba(244,63,94,0.1)]"
                  : "border-white/5 hover:border-white/10",
              )}
            >
              <div className="col-span-7">
                <FormInputField
                  control={form.control}
                  name={`items.${index}.product_id`}
                  type="combobox"
                  placeholder="Search and select product..."
                  className="space-y-0"
                  inputClassName="bg-transparent border-none p-0 h-9"
                  isLoading={isLoading}
                  onSearchValueChange={setSearchTerm}
                  options={rowOptions}
                  extraContent={
                    currentProduct && (
                      <div
                        className={cn(
                          "flex items-center gap-1.5 mt-2 ml-1 px-2 py-1 rounded-md w-fit transition-colors",
                          currentProduct.stock_quantity === 0
                            ? "bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20",
                        )}
                      >
                        {currentProduct.stock_quantity === 0 ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <span className="text-[11px] uppercase tracking-wider">
                          Stock: {currentProduct.stock_quantity}{" "}
                          {currentProduct.stock_quantity === 0
                            ? "Unavailable"
                            : "Available"}
                        </span>
                      </div>
                    )
                  }
                />
              </div>

              <div className="col-span-3">
                <FormInputField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  type="number"
                  placeholder="Qty"
                  className="space-y-0"
                  inputClassName={cn(
                    "h-9 bg-transparent border-white/10 transition-colors focus:ring-1",
                    currentProduct &&
                      Number(form.watch(`items.${index}.quantity`)) >
                        currentProduct.stock_quantity &&
                      "border-rose-500 focus:ring-rose-500 text-rose-500",
                  )}
                  extraContent={
                    currentProduct &&
                    Number(form.watch(`items.${index}.quantity`)) >
                      currentProduct.stock_quantity && (
                      <p className="text-[10px] text-rose-500 mt-1 font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Exceeds availability
                      </p>
                    )
                  }
                />
              </div>

              <div className="col-span-2 flex justify-end pt-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    remove(index);
                    // Force re-validation after removal to update isValid state
                    setTimeout(() => form.trigger("items"), 0);
                  }}
                  className="h-9 w-9 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20 -mx-3 px-3 py-4 rounded-b-xl">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
            Estimated Total
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white tracking-tight">
              ${totalPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">USD</span>
          </div>
        </div>
        {form.formState.errors.items && (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-3 py-2 rounded-lg border border-rose-400/20 animate-in fade-in slide-in-from-right-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Insufficient Stock</span>
          </div>
        )}
      </div>
    </div>
  );
}
