import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
