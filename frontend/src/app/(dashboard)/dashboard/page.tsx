import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDashboardData,
  getLatestActivities,
} from "@/actions/dashboard.actions";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [statsResponse, activitiesResponse] = await Promise.all([
    getDashboardData(),
    getLatestActivities(),
  ]);

  const dashboardData = statsResponse.success ? statsResponse.data : null;
  const activities = activitiesResponse.success ? activitiesResponse.data : [];

  const stats = [
    {
      title: "Total Orders Today",
      value: dashboardData?.totalOrdersToday?.toString() || "0",
      icon: ShoppingCart,
      description:
        "Pending: " + (dashboardData?.pendingVsCompleted?.Pending || 0),
      trend: "neutral",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Revenue Today",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(dashboardData?.revenueToday || 0),
      icon: DollarSign,
      description: "Estimated",
      trend: "neutral",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Low Stock Items",
      value: dashboardData?.lowStockCount?.toString() || "0",
      icon: AlertTriangle,
      description:
        dashboardData?.lowStockCount > 0
          ? "Needs attention"
          : "Everything clear",
      trend: dashboardData?.lowStockCount > 0 ? "down" : "up",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      title: "Total Products",
      value: dashboardData?.totalProducts?.toString() || "0",
      icon: Package,
      description: "In inventory",
      trend: "neutral",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your inventory today."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-slate-900/40 backdrop-blur-xl border-white/5 transition-all hover:bg-slate-900/60 hover:border-white/10 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-slate-500 group-hover:text-slate-400 transition-colors">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "p-2.5 rounded-xl shadow-inner transition-transform group-hover:scale-110 duration-300",
                  stat.bg,
                )}
              >
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

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-7 mt-4">
        <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recent Activity
              </CardTitle>
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[380px] p-6 pt-0">
            <div className="space-y-6">
              {activities.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                activities.map((activity: any, i: number) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 animate-in fade-in slide-in-from-left duration-500 group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-150 transition-transform" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        <span className="text-indigo-400 font-bold">
                          {activity.user_id?.email || "System"}
                        </span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {activity.details}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 gap-3">
                  <div className="p-4 rounded-full bg-white/5">
                    <Clock className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="text-sm font-medium opacity-50 uppercase tracking-widest">
                    No recent activity detected
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-400" />
              Product Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] p-6 pt-0">
            <div className="space-y-1">
              {dashboardData?.productSummary?.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dashboardData.productSummary.map((product: any, i: number) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 animate-in fade-in slide-in-from-right duration-500"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          product.status === "Low Stock"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-emerald-500/10 text-emerald-400",
                        )}
                      >
                        {product.status === "Low Stock" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                          {product.stock_quantity} in stock
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-bold border-0 px-2 py-0.5",
                        product.status === "Low Stock"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-emerald-500/10 text-emerald-400",
                      )}
                    >
                      {product.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 gap-3 opacity-30 italic">
                  <Package className="h-8 w-8" />
                  <p className="text-[10px] tracking-widest uppercase font-bold">
                    No products found
                  </p>
                </div>
              )}
            </div>

            {dashboardData?.productSummary?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button className="w-full py-2.5 rounded-xl bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                  Manage Inventory
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
