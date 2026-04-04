import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden",
        className,
      )}
    >
      {/* Header Skeleton */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 bg-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-800 rounded-md animate-pulse"
            style={{ width: `${((i * 13) % 40) + 40}%` }}
          />
        ))}
      </div>

      {/* Rows Skeleton */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4 px-6 py-5">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-slate-800/50 rounded-md animate-pulse"
                style={{
                  width: `${(((rowIndex * cols + colIndex) * 17) % 50) + 30}%`,
                  animationDelay: `${(rowIndex * cols + colIndex) * 50}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
