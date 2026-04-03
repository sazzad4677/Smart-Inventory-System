"use client";
import { cn } from "@/lib/utils";
import { cloneElement } from "react";

interface EmptyStateProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center animate-in fade-in zoom-in duration-300",
        className,
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        {cloneElement(icon, {
          className: cn(
            "h-10 w-10 text-muted-foreground/60",
            icon.props.className,
          ),
        })}
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
