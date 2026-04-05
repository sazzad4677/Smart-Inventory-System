import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, Package } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header Placeholder */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-white/5 rounded-lg animate-pulse mt-2" />
      </div>

      {/* Stats Grid Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="bg-slate-900/40 backdrop-blur-xl border-white/5"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="p-2.5 rounded-xl bg-white/5 h-10 w-10 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mt-1" />
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-7 mt-4">
        {/* Recent Activity Placeholder */}
        <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400 opacity-20" />
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[380px] p-6 pt-0 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500/20" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Product Summary Placeholder */}
        <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5 overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-400 opacity-20" />
              <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="h-[380px] p-6 pt-0 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 h-8 w-8" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-24 bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-white/10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
