import { cn } from "@/lib/utils";
import { CircleCheck, CircleAlert, CircleSlash } from "lucide-react";

export type ProductStatus = "In Stock" | "Out of Stock" | "Restock Queue";

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    "In Stock": {
      color:
        "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
      icon: <CircleCheck className="mr-1.5 h-3.5 w-3.5" />,
    },
    "Restock Queue": {
      color:
        "border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
      icon: <CircleAlert className="mr-1.5 h-3.5 w-3.5" />,
    },
    "Out of Stock": {
      color:
        "border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]",
      icon: <CircleSlash className="mr-1.5 h-3.5 w-3.5" />,
    },
  };

  const config = statusConfig[status] || statusConfig["In Stock"];

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
        config.color,
        className,
      )}
    >
      {config.icon}
      {status}
    </div>
  );
}
