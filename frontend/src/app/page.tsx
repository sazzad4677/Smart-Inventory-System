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
      color: "text-blue-600",
      bg: "bg-blue-100/50 dark:bg-blue-900/20",
    },
    {
      title: "Revenue Today",
      value: "$1,234.56",
      icon: DollarSign,
      description: "+8% from yesterday",
      trend: "up",
      color: "text-emerald-600",
      bg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    },
    {
      title: "Low Stock Items",
      value: "7",
      icon: AlertTriangle,
      description: "Needs attention",
      trend: "down",
      color: "text-rose-600",
      bg: "bg-rose-100/50 dark:bg-rose-900/20",
    },
    {
      title: "Total Products",
      value: "142",
      icon: Package,
      description: "Across 12 categories",
      trend: "neutral",
      color: "text-amber-600",
      bg: "bg-amber-100/50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your inventory today."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="flex items-center text-xs mt-1">
                {stat.trend === "up" && (
                  <>
                    <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-emerald-500 font-bold" />
                    <span className="text-emerald-500 font-medium">
                      {stat.description}
                    </span>
                  </>
                )}
                {stat.trend === "down" && (
                  <>
                    <ArrowDownRight className="mr-1 h-3.5 w-3.5 text-rose-500 font-bold" />
                    <span className="text-rose-500 font-medium">
                      {stat.description}
                    </span>
                  </>
                )}
                {stat.trend === "neutral" && (
                  <span className="text-muted-foreground font-medium">
                    {stat.description}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-6 space-y-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-6 flex flex-col justify-end space-y-3">
            <div className="flex gap-4 items-end h-full">
              {[60, 40, 80, 50, 90].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-full animate-pulse rounded-t-md bg-muted/80"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
