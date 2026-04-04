"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface PaginationProps {
  meta: PaginationMeta;
}

export function Pagination({ meta }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(createPageURL(page));
    });
  };

  if (meta.total <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-slate-400 flex items-center gap-2">
        {isPending && (
          <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
        )}
        <span>
          Showing{" "}
          <span className="font-medium text-slate-200">
            {(meta.page - 1) * meta.limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-200">
            {Math.min(meta.page * meta.limit, meta.total)}
          </span>{" "}
          of <span className="font-medium text-slate-200">{meta.total}</span>{" "}
          products
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page <= 1 || isPending}
          className="h-8 w-8 rounded-lg border-white/5 bg-slate-900/50 hover:bg-white/5 text-slate-400"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: meta.totalPage }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={isPending}
                className={cn(
                  "h-8 min-w-[32px] rounded-lg border-white/5 transition-all shrink-0 select-none",
                  meta.page === page
                    ? "bg-indigo-600 text-white border-indigo-600 font-bold scale-105 z-10"
                    : "bg-slate-900/50 text-slate-400 hover:bg-white/5",
                )}
              >
                <span className="sr-only">Page </span>
                <span className="inline-block leading-none">
                  &#8203;{page}&#8203;
                </span>
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPage || isPending}
          className="h-8 w-8 rounded-lg border-white/5 bg-slate-900/50 hover:bg-white/5 text-slate-400"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
