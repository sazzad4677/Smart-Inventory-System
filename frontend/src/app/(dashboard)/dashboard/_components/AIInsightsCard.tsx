"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCcw, BrainCircuit } from "lucide-react";
import { getAIInsights } from "@/actions/dashboard.actions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function AIInsightsCard() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const result = await getAIInsights();
      if (result.success) {
        setInsights(result.data.insights);
      } else {
        setError(result.error || "Failed to load insights");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] group transition-all duration-500 hover:border-indigo-500/40">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />

      <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          Inventory Oracle
        </CardTitle>
        <button
          onClick={fetchInsights}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh Insights"
        >
          <RefreshCcw
            className={cn(
              "h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors",
              isRefreshing && "animate-spin text-indigo-400",
            )}
          />
        </button>
      </CardHeader>

      <CardContent className="relative z-10">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-[90%] bg-white/5" />
            <Skeleton className="h-4 w-[85%] bg-white/5" />
            <Skeleton className="h-4 w-[60%] bg-white/5" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
            <BrainCircuit className="h-8 w-8 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-widest">
              {error}
            </p>
            <button
              onClick={fetchInsights}
              className="mt-2 text-[10px] font-bold text-indigo-400 hover:underline px-3 py-1 rounded-full bg-indigo-500/5"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="text-sm leading-relaxed text-slate-300 font-medium font-sans whitespace-pre-line bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent italic">
              {insights || "Thinking..."}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 backdrop-blur-md">
                Gemini 1.5 Flash
              </span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                AI Generated
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
