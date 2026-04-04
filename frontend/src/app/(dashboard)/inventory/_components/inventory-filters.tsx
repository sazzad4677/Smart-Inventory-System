"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { AppSelect, AppSelectOption } from "@/components/shared/app-select";
import { cn } from "@/lib/utils";

interface InventoryFiltersProps {
  categoryOptions: AppSelectOption[];
}

export function InventoryFilters({ categoryOptions }: InventoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchTerm") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isPending, startTransition] = useTransition();

  // Update searchTerm URL param and reset page to 1
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentSearch = searchParams.get("searchTerm") || "";
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set("searchTerm", debouncedSearch);
      } else {
        params.delete("searchTerm");
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", value);
    params.set("page", "1");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const limitOptions: AppSelectOption[] = [
    { label: "5 per page", value: "5" },
    { label: "10 per page", value: "10" },
    { label: "20 per page", value: "20" },
    { label: "50 per page", value: "50" },
  ];

  const options: AppSelectOption[] = [
    { label: "All Categories", value: "all" },
    ...categoryOptions.map((cat) => ({ label: cat.label, value: cat.label })),
  ];

  return (
    <div
      className={cn(
        "flex flex-col xl:flex-row gap-4 items-center transition-opacity duration-200",
        isPending && "opacity-50 pointer-events-none",
      )}
    >
      <div className="relative w-full xl:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
        <AppSelect
          value={searchParams.get("category") || "all"}
          options={options}
          onValueChange={handleCategoryChange}
          triggerClassName="w-full sm:w-[220px]"
          placeholder="Filter by Category"
        />

        <AppSelect
          value={searchParams.get("limit") || "10"}
          options={limitOptions}
          onValueChange={handleLimitChange}
          triggerClassName="w-full sm:w-[160px]"
          placeholder="Rows per page"
        />
      </div>
    </div>
  );
}
