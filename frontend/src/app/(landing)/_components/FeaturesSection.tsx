"use client";

import {
  Activity,
  BarChart3,
  Boxes,
  FileClock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Workflow,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Container, Section, SectionHeader } from "./layout";
import { StaggerContainer, StaggerItem } from "./motion";

const features = [
  {
    icon: Activity,
    title: "Real-time stock sync",
    desc: "Every sale, return and transfer updates the dashboard in under 200ms — no polling, no stale numbers.",
    accent: "from-indigo-500 to-cyan-400",
    span: "lg:col-span-7",
    visual: "chart",
  },
  {
    icon: Sparkles,
    title: "AI restock forecasts",
    desc: "Our engine predicts the next 14 days of demand per SKU and writes the purchase orders for you.",
    accent: "from-fuchsia-500 to-violet-500",
    span: "lg:col-span-5",
    visual: "ai",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    desc: "Granular scopes, audit trails, and SOC 2-ready controls for every warehouse and user.",
    accent: "from-emerald-500 to-teal-400",
    span: "lg:col-span-4",
    visual: "shield",
  },
  {
    icon: Truck,
    title: "Supplier portal",
    desc: "Send POs and accept ASNs directly. Track shipments in-flight with live status pings.",
    accent: "from-amber-500 to-orange-400",
    span: "lg:col-span-4",
    visual: "ship",
  },
  {
    icon: RefreshCw,
    title: "Two-way sync",
    desc: "Push and pull from Shopify, Stripe, QuickBooks, NetSuite and Xero without a line of code.",
    accent: "from-sky-500 to-blue-500",
    span: "lg:col-span-4",
    visual: "sync",
  },
  {
    icon: FileClock,
    title: "Immutable audit log",
    desc: "Every write is signed and indexed. Export to S3, BigQuery, or your SIEM in one click.",
    accent: "from-rose-500 to-pink-500",
    span: "lg:col-span-12",
    visual: "audit",
  },
];

export default function FeaturesSection() {
  return (
    <Section id="features" tone="light" bg="grid" withGlow>
      <Container>
        <SectionHeader
          eyebrow="Features"
          eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
          align="center"
          title={
            <>
              Everything you need to run inventory,{" "}
              <span className="text-gradient-brand">nothing you don’t</span>.
            </>
          }
          description="Six tightly-scoped modules. Each one replaces a spreadsheet, a chat thread, and a meeting you used to have on Mondays."
        />

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 md:mt-16 lg:grid-cols-12">
          {features.map((f) => (
            <StaggerItem
              key={f.title}
              className={`${f.span} ${f.span.includes("col-span-12") ? "" : "min-h-[260px] sm:min-h-[280px]"}`}
            >
              <BentoCard feature={f} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}

type Feature = (typeof features)[number];

function BentoCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smx = useSpring(mx, { stiffness: 200, damping: 25 });
  const smy = useSpring(my, { stiffness: 200, damping: 25 });
  const bgX = useTransform(smx, (v) => `${v}%`);
  const bgY = useTransform(smy, (v) => `${v}%`);

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
      onMouseLeave={() => {
        mx.set(50);
        my.set(50);
      }}
      className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] transition hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] sm:p-7"
    >
      <motion.div
        aria-hidden
        style={{
          background: `radial-gradient(360px circle at ${bgX.get()} ${bgY.get()}, rgba(99,102,241,0.18), transparent 60%)`,
        }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">
        <div
          className={`mb-5 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-indigo-500/20`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {feature.title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          {feature.desc}
        </p>

        <div className="mt-5 flex-1 sm:mt-6">
          <FeatureVisual kind={feature.visual} />
        </div>
      </div>
    </motion.div>
  );
}

function FeatureVisual({ kind }: { kind: string }) {
  switch (kind) {
    case "chart":
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium">Stock velocity (7d)</span>
            <span className="text-emerald-600">+24.1%</span>
          </div>
          <svg viewBox="0 0 320 90" className="mt-2 w-full">
            <defs>
              <linearGradient id="bentoChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,70 C30,55 50,60 75,40 C100,22 130,50 160,38 C190,28 220,55 250,30 C280,12 300,22 320,15 L320,90 L0,90 Z"
              fill="url(#bentoChart)"
            />
            <path
              d="M0,70 C30,55 50,60 75,40 C100,22 130,50 160,38 C190,28 220,55 250,30 C280,12 300,22 320,15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {[15, 30, 45, 60, 75].map((x) => (
              <circle
                key={x}
                cx={20 + x * 3.5}
                cy={70 - x * 0.6}
                r="2.4"
                fill="#fff"
                stroke="#6366f1"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      );
    case "ai":
      return (
        <div className="space-y-2">
          {[
            { sku: "SKU-A092", need: "+180", conf: 92 },
            { sku: "SKU-B441", need: "+45", conf: 78 },
            { sku: "SKU-C207", need: "+22", conf: 64 },
          ].map((row) => (
            <div
              key={row.sku}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px]"
            >
              <span className="font-mono text-slate-700">{row.sku}</span>
              <span className="text-slate-500">restock {row.need}</span>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                {row.conf}%
              </span>
            </div>
          ))}
        </div>
      );
    case "shield":
      return (
        <div className="grid grid-cols-3 gap-2">
          {["Admin", "Manager", "Viewer"].map((r, i) => (
            <div
              key={r}
              className={`rounded-lg border px-3 py-2 text-center text-[11px] font-medium ${
                i === 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : i === 1
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {r}
            </div>
          ))}
          <div className="col-span-3 mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            SOC 2 controls active
          </div>
        </div>
      );
    case "ship":
      return (
        <div className="space-y-2 text-[12px]">
          {[
            { name: "PO-1042 · Northwind", state: "In transit" },
            { name: "PO-1041 · Lumen Labs", state: "Delivered" },
            { name: "PO-1040 · Helix", state: "Picking" },
          ].map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="font-medium text-slate-700">{r.name}</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {r.state}
              </span>
            </div>
          ))}
        </div>
      );
    case "sync":
      return (
        <div className="grid grid-cols-4 gap-2">
          {["Shopify", "Stripe", "QBO", "NetSuite"].map((n) => (
            <div
              key={n}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] font-medium text-slate-700"
            >
              {n}
            </div>
          ))}
          <div className="col-span-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Workflow className="h-3.5 w-3.5" />
            2-way sync · 12s ago
          </div>
        </div>
      );
    case "audit":
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <BarChart3 className="h-3.5 w-3.5" />
            Today’s activity
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {[40, 65, 30, 80, 50, 90, 45, 70, 60, 95, 55, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-pink-400"
                style={{ height: `${h}%`, minHeight: 4 }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <Boxes className="h-3.5 w-3.5" />
            1,284 events · all signed
          </div>
        </div>
      );
    default:
      return null;
  }
}
