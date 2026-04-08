"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorViewProps {
  error: Error & { digest?: string };
  reset?: () => void;
  isGlobal?: boolean;
}

export function ErrorView({ error, reset, isGlobal = false }: ErrorViewProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        {/* Decorative backdrop glow */}
        <div className="absolute inset-0 -z-10 animate-pulse bg-red-500/20 blur-[60px] rounded-full scale-150" />

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 shadow-xl shadow-red-500/5 backdrop-blur-md">
          <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-100">
        Something went wrong!
      </h2>

      <p className="mb-8 max-w-md text-slate-400">
        {error.message ||
          "An unexpected error occurred. We've been notified and are working on a fix."}
        {error.digest && (
          <span className="mt-2 block font-mono text-xs opacity-50">
            Error ID: {error.digest}
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {reset && (
          <button
            onClick={() => reset()}
            className="group relative flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
            Try again
          </button>
        )}

        <Link
          href={isGlobal ? "/dashboard" : "/"}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-100 backdrop-blur-sm"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Background hint for global error */}
      {isGlobal && (
        <div className="fixed inset-0 -z-20 bg-slate-950">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
        </div>
      )}
    </div>
  );
}
