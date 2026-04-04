"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSelect, AppSelectOption } from "@/components/shared/app-select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/validations";
import { FilterX, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
    startTransition(() => {
      router.push("/orders");
    });
  };

  const hasFilters =
    searchParams.get("status") ||
    searchParams.get("startDate") ||
    searchParams.get("endDate");

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-4 items-end lg:items-center transition-all duration-300",
        isPending && "opacity-80",
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 w-full lg:w-auto">
        <div className="space-y-1.5 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Status
          </label>
          <AppSelect
            value={searchParams.get("status") || "all"}
            options={statusOptions}
            onValueChange={(val) => updateFilters({ status: val })}
            triggerClassName="w-full lg:w-[180px] bg-slate-900/40 border-white/5 h-10"
            placeholder="Select Status"
          />
        </div>

        <div className="space-y-1.5 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Start Date
          </label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/70 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
            <Input
              type="date"
              value={searchParams.get("startDate") || ""}
              max={searchParams.get("endDate") || ""}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              className="pl-10 bg-slate-900/40 border-white/5 h-10 text-xs text-white cursor-pointer hide-calendar-icon shadow-sm hover:border-white/10 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            End Date
          </label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/70 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
            <Input
              type="date"
              min={searchParams.get("startDate") || ""}
              value={searchParams.get("endDate") || ""}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
              className="pl-10 bg-slate-900/40 border-white/5 h-10 text-xs text-white cursor-pointer hide-calendar-icon shadow-sm hover:border-white/10 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
            Limit
          </label>
          <AppSelect
            value={searchParams.get("limit") || "10"}
            options={limitOptions}
            onValueChange={(val) => updateFilters({ limit: val })}
            triggerClassName="w-full lg:w-[140px] bg-slate-900/40 border-white/5 h-10"
            placeholder="Show"
          />
        </div>
      </div>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 px-4 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-xl border border-transparent hover:border-rose-500/20 mt-3"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
