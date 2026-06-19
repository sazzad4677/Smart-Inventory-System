"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

/* ----------------------------------------------------------
   DashboardMock — fully CSS/SVG dashboard preview
   ---------------------------------------------------------- */
export function DashboardMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{ transformStyle: "preserve-3d" }}
      className="relative w-full"
    >
      {/* Floating chip — top-left, sits ABOVE the window so it never
          overlaps the sidebar header. */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute -left-3 -top-7 z-30 hidden items-center gap-2 rounded-full glass-dark py-1.5 pl-1.5 pr-3 ring-soft sm:flex lg:-left-5 lg:-top-8"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <TrendingUp className="h-3.5 w-3.5" />
        </span>
        <span className="text-[12px] font-semibold text-white">
          +248 SKUs synced
        </span>
      </motion.div>

      {/* Floating chip — bottom-right, sits BELOW the window so it
          never overlaps the activity feed rows. */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="absolute -bottom-7 -right-3 z-30 hidden items-center gap-2 rounded-full glass-dark py-1.5 pl-1.5 pr-3 ring-soft sm:flex lg:-bottom-8 lg:-right-5"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30">
          <Bell className="h-3.5 w-3.5" />
        </span>
        <span className="text-[12px] font-semibold text-white">
          Low stock alert
        </span>
      </motion.div>

      {/* App window */}
      <div className="glass-dark relative overflow-hidden rounded-2xl ring-soft">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-slate-400 ring-1 ring-inset ring-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            app.smart-inventory.dev / dashboard
          </div>
          <div className="text-[11px] text-slate-500">v2.4</div>
        </div>

        {/* body */}
        <div className="grid grid-cols-12 gap-0">
          {/* sidebar */}
          <aside className="col-span-3 hidden border-r border-white/5 bg-white/[0.02] p-3 sm:block">
            <div className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Workspace
            </div>
            <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
            <SidebarItem icon={<Boxes />} label="Inventory" badge="1.2k" />
            <SidebarItem icon={<ShoppingCart />} label="Orders" badge="14" />
            <SidebarItem icon={<Package />} label="Restock" />
            <SidebarItem icon={<Users />} label="Team" />
            <SidebarItem icon={<Settings />} label="Settings" />

            <div className="mt-6 rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent p-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
                AI tip
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Raise SKU-B402 reorder point by 18% to avoid next week&apos;s
                predicted dip.
              </div>
            </div>
          </aside>

          {/* main */}
          <div className="col-span-12 p-4 sm:col-span-9 sm:p-5">
            {/* topbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-500">
                  Good morning, Asha
                </div>
                <div className="text-base font-semibold text-white sm:text-lg">
                  Operations overview
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 sm:flex">
                <Search className="h-3.5 w-3.5" />
                Search products, orders…
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                AC
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              <KpiCard
                label="Stock value"
                value="$1.42M"
                delta="+12.4%"
                up
                color="from-indigo-500/30 to-indigo-500/0"
              />
              <KpiCard
                label="SKUs tracked"
                value="10,284"
                delta="+248"
                up
                color="from-cyan-500/30 to-cyan-500/0"
              />
              <KpiCard
                label="Low stock"
                value="23"
                delta="-9"
                up
                color="from-amber-500/30 to-amber-500/0"
              />
              <KpiCard
                label="Pending orders"
                value="142"
                delta="+18"
                color="from-fuchsia-500/30 to-fuchsia-500/0"
              />
            </div>

            {/* chart + activity */}
            <div className="mt-4 grid grid-cols-12 gap-3">
              <div className="col-span-12 rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:col-span-7 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-slate-500">
                      Inventory velocity
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Last 14 days
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-white/[0.04] p-0.5 text-[11px] text-slate-400 ring-1 ring-inset ring-white/5">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-white">
                      In
                    </span>
                    <span className="px-2 py-0.5">Out</span>
                    <span className="px-2 py-0.5">Net</span>
                  </div>
                </div>
                <Chart />
              </div>

              <div className="col-span-12 rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:col-span-5 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">
                    Recent activity
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    LIVE
                  </span>
                </div>
                <ul className="space-y-2.5 text-xs">
                  <ActivityRow
                    name="Maya"
                    action="received"
                    target="42 × SKU-0192"
                    color="bg-emerald-500/15 text-emerald-300"
                  />
                  <ActivityRow
                    name="Liam"
                    action="approved restock for"
                    target="SKU-B402"
                    color="bg-indigo-500/15 text-indigo-300"
                  />
                  <ActivityRow
                    name="AI Engine"
                    action="flagged"
                    target="3 SKUs at risk"
                    color="bg-fuchsia-500/15 text-fuchsia-300"
                  />
                  <ActivityRow
                    name="Diego"
                    action="shipped order"
                    target="ORD-4421"
                    color="bg-amber-500/15 text-amber-300"
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`mb-1 flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[12px] transition ${
        active
          ? "bg-gradient-to-r from-indigo-500/20 to-transparent text-white ring-1 ring-inset ring-indigo-400/20"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="grid h-6 w-6 place-items-center">{icon}</span>
        {label}
      </span>
      {badge && (
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
          {badge}
        </span>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  up,
  color,
}: {
  label: string;
  value: string;
  delta: string;
  up?: boolean;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2.5 sm:p-3">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b ${color}`}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          {label}
        </div>
        <div className="mt-1 text-base font-bold text-white sm:text-lg">
          {value}
        </div>
        <div
          className={`mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold ${
            up ? "text-emerald-300" : "text-slate-400"
          }`}
        >
          {up ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  name,
  action,
  target,
  color,
}: {
  name: string;
  action: string;
  target: string;
  color: string;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${color}`}
      >
        {name.slice(0, 1)}
      </span>
      <span className="text-slate-300">
        <span className="font-semibold text-white">{name}</span> {action}{" "}
        <span className="text-slate-100">{target}</span>
      </span>
    </li>
  );
}

/* ----------------------------------------------------------
   Chart — pure-SVG animated bar+area combo
   ---------------------------------------------------------- */
function Chart() {
  // 14 daily values
  const data = [22, 28, 26, 34, 40, 36, 48, 44, 52, 58, 54, 62, 68, 74];
  const w = 320;
  const h = 120;
  const padX = 6;
  const padY = 10;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const max = Math.max(...data);
  const stepX = innerW / (data.length - 1);
  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padY + innerH - (d / max) * innerH;
    return { x, y };
  });
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + innerH} L ${points[0].x} ${padY + innerH} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-28 w-full sm:h-32"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(129,140,248)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(129,140,248)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(129,140,248)" />
            <stop offset="50%" stopColor="rgb(192,132,252)" />
            <stop offset="100%" stopColor="rgb(244,114,182)" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={w - padX}
            y1={padY + innerH * g}
            y2={padY + innerH * g}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 4"
          />
        ))}
        {/* area */}
        <motion.path
          d={areaPath}
          fill="url(#lineFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
        {/* line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#stroke)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {/* dots */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.2"
            fill="rgb(244,114,182)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0 + i * 0.04, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
