import { getOrderByIdAction } from "@/actions/order.actions";
import { PageHeader } from "@/components/layout/page-header";
import { OrderStatusUpdate } from "../_components/order-status-update";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import {
  ClipboardList,
  User,
  Calendar,
  CreditCard,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface OrderIdPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderIdPageProps) {
  const { id } = await params;
  const result = await getOrderByIdAction(id);
  const orderTitle =
    result.success && result.data
      ? result.data.order.order_id
      : id.slice(-6).toUpperCase();
  return {
    title: `Order ${orderTitle} | Smart Inventory`,
  };
}

export default async function OrderIdPage({ params }: OrderIdPageProps) {
  const { id } = await params;
  const result = await getOrderByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { order, items } = result.data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Order Details`}
        description={`Viewing detailed information for Order ${order.order_id}`}
      >
        <OrderStatusUpdate orderId={order._id} currentStatus={order.status} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Information */}
        <div className="md:col-span-1 flex flex-col gap-8">
          <Card className="bg-slate-900/20 border-white/5 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5 px-6 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-400" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <div className="px-6 py-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </span>
                  <StatusBadge
                    status={order.status as StatusType}
                    className="w-fit"
                  />
                </div>
                <div className="px-6 py-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Customer
                  </span>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <User className="h-4 w-4 text-slate-400" />
                    {order.customer_name}
                  </div>
                </div>
                <div className="px-6 py-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Ordered At
                  </span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(order.created_at))}
                  </div>
                </div>
                <div className="px-6 py-4 flex flex-col bg-indigo-500/5 group transition-colors duration-300">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 group-hover:translate-x-1 transition-transform">
                    Total Amount Paid
                  </span>
                  <div className="flex items-center gap-2 text-2xl font-black text-white">
                    <CreditCard className="h-6 w-6 text-indigo-400" />$
                    {order.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Items List */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/20 border-white/5 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="bg-white/5 border-b border-white/5 px-6 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-400" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.02]">
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr
                        key={item._id}
                        className="text-sm hover:bg-white/[0.04] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {item.product_id?.name || "Unknown Product"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ID: {item.product_id?.product_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-300">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-bold border border-white/5 text-slate-400">
                            x {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-300">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-indigo-400">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
