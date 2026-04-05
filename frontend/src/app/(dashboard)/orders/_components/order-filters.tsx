"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSelect, AppSelectOption } from "@/components/shared/app-select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/validations";
import { FilterX, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderFilters() {
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

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const statusOptions: AppSelectOption[] = [
    { label: "All Statuses", value: "all" },
    ...Object.values(OrderStatus).map((status) => ({
      label: status,
      value: status,
    })),
  ];

  const limitOptions: AppSelectOption[] = [
    { label: "10 per page", value: "10" },
    { label: "20 per page", value: "20" },
    { label: "50 per page", value: "50" },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/orders");
    });
  };

  const hasFilters =
    searchParams.get("status") ||
    searchParams.get("startDate") ||
    searchParams.get("endDate") ||
    searchParams.get("searchTerm");

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-4 transition-all duration-300",
        isPending && "opacity-80",
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full items-start transition-all duration-300">
        {/* Search Field */}
        <div className="flex flex-col gap-2 w-full sm:col-span-2 xl:col-span-1">
          <div className="h-4 flex items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
              Search
            </label>
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-slate-900/50 border-white/10 hover:border-white/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Status Field */}
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 flex items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
              Status
            </label>
          </div>
          <div className="relative">
            <AppSelect
              value={searchParams.get("status") || "all"}
              options={statusOptions}
              onValueChange={(val) => updateFilters({ status: val })}
              triggerClassName="w-full bg-slate-900/50 border-white/10 !h-11 hover:border-white/20 transition-all"
              placeholder="Select Status"
            />
          </div>
        </div>

        {/* Start Date Field */}
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 flex items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
              Start Date
            </label>
          </div>
          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
            <Input
              type="date"
              value={searchParams.get("startDate") || ""}
              max={searchParams.get("endDate") || ""}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              onClick={(e) => e.currentTarget.showPicker()}
              className="pl-11 h-11 bg-slate-900/50 border-white/10 text-xs text-white cursor-pointer hide-calendar-icon shadow-sm hover:border-white/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* End Date Field */}
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 flex items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
              End Date
            </label>
          </div>
          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
            <Input
              type="date"
              min={searchParams.get("startDate") || ""}
              value={searchParams.get("endDate") || ""}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
              onClick={(e) => e.currentTarget.showPicker()}
              className="pl-11 h-11 bg-slate-900/50 border-white/10 text-xs text-white cursor-pointer hide-calendar-icon shadow-sm hover:border-white/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Limit Field */}
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 flex items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
              Limit
            </label>
          </div>
          <div className="relative">
            <AppSelect
              value={searchParams.get("limit") || "10"}
              options={limitOptions}
              onValueChange={(val) => updateFilters({ limit: val })}
              triggerClassName="w-full bg-slate-900/50 border-white/10 !h-11 hover:border-white/20 transition-all"
              placeholder="Show"
            />
          </div>
        </div>

        {/* Clear Button */}
        {hasFilters && (
          <div className="flex flex-col gap-2 w-full">
            <div className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-11 px-4 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-xl border border-white/10 hover:border-rose-500/20"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
