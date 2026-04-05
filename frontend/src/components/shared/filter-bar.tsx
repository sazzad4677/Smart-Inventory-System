"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Calendar, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppSelect, AppSelectOption } from "@/components/shared/app-select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export type FilterField = {
  key: string;
  label: string;
  type: "search" | "select" | "date";
  options?: AppSelectOption[];
  placeholder?: string;
  defaultValue?: string;
  className?: string;
};

interface FilterBarProps {
  filters: FilterField[];
  className?: string;
}

export function FilterBar({ filters, className }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Initialize local state for all filters
  const [localState, setLocalState] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    filters.forEach((f) => {
      initialState[f.key] = searchParams.get(f.key) || f.defaultValue || "";
    });
    return initialState;
  });

  // Keep track of search terms for debouncing
  const searchFilters = filters.filter((f) => f.type === "search");

  // Custom debounce logic for search fields
  const searchKey = searchFilters[0]?.key;
  const debouncedSearch = useDebounce(localState[searchKey] || "", 500);

  // Track searchParams to detect changes during render
  const [prevParams, setPrevParams] = useState(searchParams);

  // Synchronize local state with URL changes during render phase
  // This avoids the "cascading render" warning and performance hit of useEffect
  if (searchParams !== prevParams) {
    setPrevParams(searchParams);

    let hasChanged = false;
    const newState = { ...localState };

    filters.forEach((f) => {
      const urlValue = searchParams.get(f.key) || f.defaultValue || "";

      // Sync non-search fields (select, date)
      if (f.type !== "search" && newState[f.key] !== urlValue) {
        newState[f.key] = urlValue;
        hasChanged = true;
      }

      // Sync search if URL is cleared
      if (f.type === "search") {
        const urlSearch = searchParams.get(f.key) || "";
        if (urlSearch === "" && newState[f.key] !== "") {
          newState[f.key] = "";
          hasChanged = true;
        }
      }
    });

    if (hasChanged) {
      setLocalState(newState);
    }
  }

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "all" || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset pagination on filter change
      params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname],
  );

  // Effect for debounced search
  useEffect(() => {
    if (searchKey) {
      const currentUrlValue = searchParams.get(searchKey) || "";
      if (debouncedSearch !== currentUrlValue) {
        updateUrl({ [searchKey]: debouncedSearch });
      }
    }
  }, [debouncedSearch, searchKey, searchParams, updateUrl]);

  const handleInputChange = (key: string, value: string, type: string) => {
    // Update local state immediately for snappy UI
    setLocalState((prev) => ({ ...prev, [key]: value }));

    // Non-search inputs trigger URL update immediately
    if (type !== "search") {
      updateUrl({ [key]: value });
    }
  };

  const clearFilters = () => {
    const clearedState: Record<string, string> = {};
    filters.forEach((f) => (clearedState[f.key] = ""));
    setLocalState(clearedState);

    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = filters.some((f) => {
    const val = searchParams.get(f.key);
    return val && val !== "all" && val !== "";
  });

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-4 transition-all duration-300",
        isPending && "opacity-80",
        className,
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full items-start transition-all duration-300">
        {filters.map((field) => (
          <div
            key={field.key}
            className={cn(
              "flex flex-col gap-2 w-full",
              field.type === "search" && "sm:col-span-2 xl:col-span-1",
              field.className,
            )}
          >
            <div className="h-4 flex items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                {field.label}
              </label>
            </div>

            {field.type === "search" && (
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
                <Input
                  placeholder={field.placeholder || `Search...`}
                  value={localState[field.key]}
                  onChange={(e) =>
                    handleInputChange(field.key, e.target.value, "search")
                  }
                  className="pl-11 h-11 bg-slate-900/50 border-white/10 hover:border-white/20 transition-all shadow-sm"
                />
              </div>
            )}

            {field.type === "select" && (
              <div className="relative">
                <AppSelect
                  value={localState[field.key] || "all"}
                  options={field.options || []}
                  onValueChange={(val) =>
                    handleInputChange(field.key, val, "select")
                  }
                  triggerClassName="w-full bg-slate-900/50 border-white/10 !h-11 hover:border-white/20 transition-all"
                  placeholder={field.placeholder || `Select ${field.label}`}
                />
              </div>
            )}

            {field.type === "date" && (
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
                <Input
                  type="date"
                  value={localState[field.key]}
                  onChange={(e) =>
                    handleInputChange(field.key, e.target.value, "date")
                  }
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="pl-11 h-11 bg-slate-900/50 border-white/10 text-xs text-white cursor-pointer hide-calendar-icon shadow-sm hover:border-white/20 transition-all font-medium"
                />
              </div>
            )}
          </div>
        ))}

        {hasActiveFilters && (
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
