"use client";

import { ErrorView } from "@/components/shared/ErrorView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <ErrorView error={error} reset={reset} />
    </div>
  );
}
