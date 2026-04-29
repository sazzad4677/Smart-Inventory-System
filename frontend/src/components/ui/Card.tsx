import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-900/45 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
