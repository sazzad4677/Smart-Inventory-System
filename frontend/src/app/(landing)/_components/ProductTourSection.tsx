"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Brain,
  ListChecks,
  RotateCcw,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";

type Tab = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  bullets: string[];
  visual: "sync" | "ai" | "restock" | "audit";
};

const tabs: Tab[] = [
  {
    key: "sync",
    label: "Real-time sync",
    icon: Activity,
    title: "One source of truth, updated the instant something changes.",
    body: "Every channel — POS, e-commerce, warehouse scanner — writes into the same event stream. The dashboard reflects new state in under 200ms.",
    bullets: [
      "WebSocket + SSE with automatic reconnection",
      "Optimistic UI with built-in rollback",
      "Idempotent writes — retries are safe",
    ],
    visual: "sync",
  },
  {
    key: "ai",
    label: "AI analytics",
    icon: Brain,
    title: "Ask a question, get a chart.",
    body: "Type “show me stockouts in Q3 for SKU-A” and the AI engine returns a chart, the SQL it ran, and an export — no analyst required.",
    bullets: [
      "Natural-language → SQL with row-level safety",
      "Auto-generated weekly briefings",
      "Drill from any KPI to its source rows",
    ],
    visual: "ai",
  },
  {
    key: "restock",
    label: "Smart restock",
    icon: ListChecks,
    title: "Purchase orders drafted before you hit the panic button.",
    body: "We blend 90-day velocity, seasonality, supplier lead time and safety stock to suggest orders ranked by margin impact.",
    bullets: [
      "One-click approve → PO sent to supplier",
      "What-if simulator with cost preview",
      "Auto-hold when cashflow is tight",
    ],
    visual: "restock",
  },
  {
    key: "audit",
    label: "Audit log",
    icon: ScanSearch,
    title: "Every change, signed and searchable.",
    body: "Every write is cryptographically signed and indexed for instant search. Reconstruct the past with a single query.",
    bullets: [
      "Tamper-evident hash chain",
      "Full-text search across actors and payloads",
      "Export to S3, BigQuery, Splunk, Datadog",
    ],
    visual: "audit",
  },
];

export default function ProductTourSection() {
  const [active, setActive] = useState(tabs[0].key);
  const tab = tabs.find((t) => t.key === active)!;
  const Icon = tab.icon;

  return (
    <Section id="product-tour" tone="dark" bg="mesh">
      <Container>
        <SectionHeader
          eyebrow="Product tour"
          eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
          align="center"
          title={
            <>
              Take it for a spin —{" "}
              <span className="text-gradient-brand">in 60 seconds</span>.
            </>
          }
          description="Four modules, one workflow. Click a tab to see how SmartInv handles the moment that matters."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          {/* tabs */}
          <div className="lg:col-span-4">
            <div
              role="tablist"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible"
              style={{ scrollbarWidth: "none" }}
            >
              {tabs.map((t) => {
                const TIcon = t.icon;
                const isActive = t.key === active;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(t.key)}
                    className={`relative flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition lg:py-4 ${
                      isActive
                        ? "border-white/15 bg-white/[0.04] text-white"
                        : "border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tour-tab-bg"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-fuchsia-500/15 ring-1 ring-white/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                        isActive
                          ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                          : "bg-white/[0.04] text-slate-300 ring-1 ring-white/10"
                      }`}
                    >
                      <TIcon className="h-4 w-4" />
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold lg:whitespace-normal">
                      {t.label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="tour-tab-dot"
                        className="ml-auto h-2 w-2 shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_12px_4px_rgba(236,72,153,0.55)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400 sm:block lg:mt-8">
              <div className="flex items-center gap-2 text-slate-200">
                <RotateCcw className="h-4 w-4 text-cyan-300" />
                Always-on replay
              </div>
              <p className="mt-2 leading-relaxed">
                Every event is replayable from the UI — perfect for post-mortems
                and onboarding new team members.
              </p>
            </div>
          </div>

          {/* panel */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c1b]/80 p-4 ring-soft sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark opacity-30" />
              <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-72 w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                    {tab.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">
                    {tab.body}
                  </p>

                  <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {tab.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] text-slate-200"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Visual kind={tab.visual} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Visual({ kind }: { kind: Tab["visual"] }) {
  switch (kind) {
    case "sync":
      return (
        <div className="rounded-xl border border-white/10 bg-[#0a0a16] p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Event stream</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              live
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { t: "12:04:21", a: "POS · Maya", m: "sale -1 SKU-A092" },
              { t: "12:04:19", a: "WH · Liam", m: "receive +180 SKU-B441" },
              { t: "12:04:16", a: "Shopify", m: "refund -2 SKU-C207" },
              { t: "12:04:12", a: "AI Engine", m: "forecast update SKU-D118" },
              { t: "12:04:09", a: "Stripe", m: "payout $4,210" },
            ].map((e) => (
              <div
                key={e.t}
                className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-[12px] font-mono"
              >
                <span className="text-slate-500">{e.t}</span>
                <span className="text-indigo-300">{e.a}</span>
                <span className="text-slate-200">{e.m}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "ai":
      return (
        <div className="rounded-xl border border-white/10 bg-[#0a0a16] p-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-slate-300">
            <Brain className="h-4 w-4 text-violet-300" />
            Show me stockouts in Q3 for SKU-A
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Forecast · SKU-A092</span>
              <span className="text-rose-300">+12% risk</span>
            </div>
            <svg viewBox="0 0 320 80" className="mt-2 w-full">
              <defs>
                <linearGradient id="aiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,60 C40,50 60,40 90,38 C130,35 150,55 190,40 C230,25 260,30 300,15 L320,12 L320,80 L0,80 Z"
                fill="url(#aiFill)"
              />
              <path
                d="M0,60 C40,50 60,40 90,38 C130,35 150,55 190,40 C230,25 260,30 300,15 L320,12"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
              />
            </svg>
            <div className="mt-3 text-[11px] text-slate-400">
              Suggested action: order{" "}
              <span className="text-white">+220 units</span> by Friday —
              confidence 92%.
            </div>
          </div>
        </div>
      );
    case "restock":
      return (
        <div className="rounded-xl border border-white/10 bg-[#0a0a16] p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Suggested POs</span>
            <span className="text-emerald-400">$12,480 estimated</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { sku: "SKU-A092", v: "+220", c: "Northwind" },
              { sku: "SKU-B441", v: "+45", c: "Lumen Labs" },
              { sku: "SKU-C207", v: "+60", c: "Helix" },
              { sku: "SKU-D118", v: "+30", c: "Atlas" },
            ].map((p) => (
              <div
                key={p.sku}
                className="grid grid-cols-12 items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-[12px]"
              >
                <span className="col-span-3 font-mono text-slate-200">
                  {p.sku}
                </span>
                <span className="col-span-3 text-indigo-300">{p.v}</span>
                <span className="col-span-4 text-slate-400">{p.c}</span>
                <span className="col-span-2 text-right">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
                    ready
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "audit":
      return (
        <div className="rounded-xl border border-white/10 bg-[#0a0a16] p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Audit timeline · last 24h</span>
            <span>1,284 events</span>
          </div>
          <div className="relative mt-4 pl-5">
            <div className="absolute left-1.5 top-1 h-[calc(100%-8px)] w-px bg-gradient-to-b from-indigo-400/60 via-violet-400/40 to-transparent" />
            {[
              { t: "12:04", a: "Maya · stock.adjust", h: "0x4a…f1" },
              { t: "11:51", a: "AI · forecast.regen", h: "0x77…3b" },
              { t: "11:32", a: "Liam · po.create", h: "0x12…9d" },
              { t: "10:48", a: "Diego · role.grant", h: "0x9e…02" },
            ].map((e, i) => (
              <div key={i} className="relative mb-3 last:mb-0">
                <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 ring-2 ring-[#0a0a16]" />
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="font-mono text-slate-500">{e.t}</span>
                  <span className="text-slate-200">{e.a}</span>
                  <span className="ml-auto font-mono text-[10px] text-slate-500">
                    {e.h}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}
