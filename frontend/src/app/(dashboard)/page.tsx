import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Orders Today",
      value: "24",
      icon: ShoppingCart,
      description: "+12% from yesterday",
      trend: "up",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Revenue Today",
      value: "$1,234.56",
      icon: DollarSign,
      description: "+8% from yesterday",
      trend: "up",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Low Stock Items",
      value: "7",
      icon: AlertTriangle,
      description: "Needs attention",
      trend: "down",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      title: "Total Products",
      value: "142",
      icon: Package,
      description: "Across 12 categories",
      trend: "neutral",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your inventory today."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-slate-500">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2.5 rounded-xl shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-white mt-1">
                {stat.value}
              </div>
              <p className="flex items-center text-xs mt-2">
                {stat.trend === "up" && (
                  <>
                    <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold tracking-tight">
                      {stat.description}
                    </span>
                  </>
                )}
                {stat.trend === "down" && (
                  <>
                    <ArrowDownRight className="mr-1 h-3.5 w-3.5 text-rose-400" />
                    <span className="text-rose-400 font-semibold tracking-tight">
                      {stat.description}
                    </span>
                  </>
                )}
                {stat.trend === "neutral" && (
                  <span className="text-slate-500 font-medium">
                    {stat.description}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-7">
        <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] p-6 pt-0">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <div className="h-10 grow rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-white">
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] p-6 pt-0 flex flex-col justify-end">
            <div className="flex gap-5 items-end h-full px-2">
              {[60, 40, 80, 50, 90].map((h, i) => (
                <div
                  key={i}
                  className="group relative flex-1 animate-in slide-in-from-bottom duration-700"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600/40 to-indigo-500/60 border-t border-x border-white/10 group-hover:from-indigo-500 group-hover:to-indigo-400 transition-all cursor-help"
                  />
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-6 px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-white/5" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
