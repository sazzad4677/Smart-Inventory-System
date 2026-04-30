import { Suspense } from "react";
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
  Activity as ActivityIcon,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDashboardData,
  getLatestActivities,
} from "@/actions/dashboard.actions";
import { Badge } from "@/components/ui/badge";
import { TrendingChart } from "./_components/TrendingChart";
import { CategoryDistribution } from "./_components/CategoryDistribution";
import { AIInsightsCard } from "./_components/AIInsightsCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData, Activity } from "@/lib/types";

export default function DashboardPage() {
  const dashboardDataPromise = getDashboardData();
  const activitiesPromise = getLatestActivities();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your inventory today."
      />

      <Suspense fallback={<StatsSkeleton />}>
        <StatsOverview promise={dashboardDataPromise} />
      </Suspense>

      <div>
        <AIInsightsCard />
      </div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-7 mt-2">
        <Suspense fallback={<ChartSkeleton className="xl:col-span-4" />}>
          <OrderTrends promise={dashboardDataPromise} />
        </Suspense>

        <Suspense fallback={<ChartSkeleton className="xl:col-span-3" />}>
          <InventoryDistribution promise={dashboardDataPromise} />
        </Suspense>
      </div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-7 mt-4">
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity promise={activitiesPromise} />
        </Suspense>

        <Suspense fallback={<ProductSummarySkeleton />}>
          <ProductSummary promise={dashboardDataPromise} />
        </Suspense>
      </div>
    </div>
  );
}

async function StatsOverview({
  promise,
}: {
  promise: Promise<{ success: boolean; data?: DashboardData }>;
}) {
  const response = await promise;
  const dashboardData = response.success ? response.data : null;

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
        (dashboardData?.lowStockCount ?? 0) > 0
          ? "Needs attention"
          : "Everything clear",
      trend: (dashboardData?.lowStockCount ?? 0) > 0 ? "down" : "up",
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
  );
}

async function OrderTrends({
  promise,
}: {
  promise: Promise<{ success: boolean; data?: DashboardData }>;
}) {
  const response = await promise;
  const dashboardData = response.success ? response.data : null;

  return (
    <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden h-full">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-indigo-400" />
          Order & Revenue Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] p-6 pt-0">
        {dashboardData?.orderTrends && (
          <TrendingChart data={dashboardData.orderTrends} />
        )}
      </CardContent>
    </Card>
  );
}

async function InventoryDistribution({
  promise,
}: {
  promise: Promise<{ success: boolean; data?: DashboardData }>;
}) {
  const response = await promise;
  const dashboardData = response.success ? response.data : null;

  return (
    <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden h-full">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-400" />
          Inventory Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] p-6 pt-0">
        {dashboardData?.categoryDistribution && (
          <CategoryDistribution data={dashboardData.categoryDistribution} />
        )}
      </CardContent>
    </Card>
  );
}

async function RecentActivity({
  promise,
}: {
  promise: Promise<{ success: boolean; data?: Activity[] }>;
}) {
  const response = await promise;
  const activities = response.success && response.data ? response.data : [];

  return (
    <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl h-full">
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
            activities.map((activity, i: number) => (
              <div
                key={activity._id}
                className="flex items-start gap-4 animate-in fade-in slide-in-from-left duration-500 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-150 transition-transform" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-all duration-300 leading-snug">
                    {activity.action_text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-400/80 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10 tracking-tight">
                      {activity.user_id?.email?.split("@")[0] || "System"}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(activity.timestamp))}
                    </span>
                  </div>
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
  );
}

async function ProductSummary({
  promise,
}: {
  promise: Promise<{ success: boolean; data?: DashboardData }>;
}) {
  const response = await promise;
  const dashboardData = response.success ? response.data : null;

  return (
    <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden h-full">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-400" />
          Product Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[380px] p-6 pt-0 flex flex-col justify-between">
        <div className="space-y-1">
          {dashboardData && dashboardData.productSummary.length > 0 ? (
            dashboardData.productSummary.map((product, i: number) => (
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
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-500 gap-3 opacity-30 italic">
              <Package className="h-8 w-8" />
              <p className="text-[10px] tracking-widest uppercase font-bold">
                No products found
              </p>
            </div>
          )}
        </div>

        {dashboardData && dashboardData.productSummary.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <button className="w-full py-2.5 rounded-xl bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
              Manage Inventory
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:gap-8">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="bg-slate-900/40 backdrop-blur-xl border-white/5"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 w-24 bg-white/5" />
            <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-white/5 mt-1" />
            <Skeleton className="h-3 w-32 bg-white/5 mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "bg-slate-900/40 backdrop-blur-xl border-white/5 h-full",
        className,
      )}
    >
      <CardHeader className="pb-6">
        <Skeleton className="h-6 w-48 bg-white/5" />
      </CardHeader>
      <CardContent className="h-[350px]">
        <Skeleton className="h-full w-full bg-white/5 rounded-xl" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="xl:col-span-4 bg-slate-900/40 backdrop-blur-xl border-white/5 h-full">
      <CardHeader className="pb-6">
        <Skeleton className="h-6 w-40 bg-white/5" />
      </CardHeader>
      <CardContent className="min-h-[380px] space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-2 w-2 rounded-full mt-1.5 bg-white/5" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[90%] bg-white/5" />
              <Skeleton className="h-3 w-24 bg-white/5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProductSummarySkeleton() {
  return (
    <Card className="xl:col-span-3 bg-slate-900/40 backdrop-blur-xl border-white/5 h-full">
      <CardHeader className="pb-6">
        <Skeleton className="h-6 w-48 bg-white/5" />
      </CardHeader>
      <CardContent className="h-[380px] space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 border border-white/5 bg-white/5 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <Skeleton className="h-3 w-16 bg-white/5" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
