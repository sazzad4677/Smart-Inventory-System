"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Stars } from "lucide-react";
import { Container } from "./layout";
import { FadeIn, Reveal } from "./motion";
import { DashboardMock } from "./DashboardMock";

const proof = ["No credit card", "14-day free trial", "SOC 2 ready"];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yMock = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-mesh-dark pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-40 md:pb-24 lg:pb-40"
    >
      {/* grid + grain layer */}
      <motion.div
        style={{ y: yBg, opacity }}
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />
      {/* spinning conic ring */}
      <motion.div
        aria-hidden
        style={{ y: yBg }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_55%,transparent_72%)] sm:h-[640px] sm:w-[640px] lg:h-[820px] lg:w-[820px]"
      >
        <div
          className="absolute inset-0 animate-aurora-spin rounded-full opacity-50"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(99,102,241,0.45), rgba(236,72,153,0.30), rgba(56,189,248,0.40), rgba(99,102,241,0.45))",
            filter: "blur(48px)",
          }}
        />
      </motion.div>
      {/* orbiting "satellite" */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
        <div className="relative h-0 w-0">
          <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(56,189,248,0.55)] animate-orbit-slow" />
          <span
            className="absolute -left-1.5 -top-1.5 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_20px_6px_rgba(236,72,153,0.55)] animate-orbit-slow"
            style={{ animationDelay: "-7s" }}
          />
        </div>
      </div>

      <Container size="wide" className="relative">
        <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Copy */}
          <div className="lg:col-span-6 xl:col-span-6">
            <FadeIn y={20}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-indigo-100 shadow-[0_0_30px_-10px_rgba(99,102,241,0.6)]">
                <Stars className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-white/90">
                  v2.4 — AI inventory engine is here
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/60" />
              </span>
            </FadeIn>

            <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              <Reveal>Inventory,</Reveal>
              <br />
              <Reveal delay={0.05}>reimagined for</Reveal>
              <br />
              <span className="text-gradient-brand">
                <Reveal delay={0.1}>modern teams.</Reveal>
              </span>
            </h1>

            <FadeIn delay={0.45} y={16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Real-time stock tracking, AI-driven restock forecasts, and
                role-based controls — wrapped in a dashboard your team will
                actually love to open.
              </p>
            </FadeIn>

            <FadeIn delay={0.55} y={16}>
              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/login"
                  id="hero-get-started"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-15px_rgba(139,92,246,0.7)] transition hover:shadow-[0_22px_50px_-15px_rgba(236,72,153,0.7)] sm:px-6 sm:py-3.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Start free trial
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-0" />
                </Link>
                <a
                  href="#product-tour"
                  id="hero-learn-more"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-100 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.06] sm:py-3.5"
                >
                  Take the product tour
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.6} y={14}>
              <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                {proof.map((p) => (
                  <li key={p} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </FadeIn>

            {/* live activity ticker */}
            <FadeIn delay={0.7} y={16}>
              <div className="mt-8 max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_40px_-25px_rgba(99,102,241,0.55)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Live · last 24h
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    auto-syncing
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                  <TickerMetric
                    label="SKUs synced"
                    value="+248"
                    tone="from-indigo-400 to-cyan-300"
                  />
                  <TickerMetric
                    label="POs created"
                    value="37"
                    tone="from-fuchsia-400 to-violet-300"
                  />
                  <TickerMetric
                    label="Alerts resolved"
                    value="92%"
                    tone="from-emerald-400 to-teal-300"
                  />
                </div>
              </div>
            </FadeIn>

            {/* live stats strip */}
            <FadeIn delay={0.75}>
              <div className="mt-10 grid max-w-md grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:mt-12 sm:gap-4 sm:pt-8">
                <Stat label="SKUs tracked" value="10K+" />
                <Stat label="Uptime SLA" value="99.9%" />
                <Stat label="API p95" value="<200ms" />
              </div>
            </FadeIn>
          </div>

          {/* Dashboard mock */}
          <motion.div
            style={{ y: yMock }}
            className="relative lg:col-span-6 xl:col-span-6"
          >
            <DashboardMock />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">
        {label}
      </div>
    </div>
  );
}

function TickerMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2.5 sm:px-3">
      <div
        className={`bg-gradient-to-r ${tone} bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-500 sm:text-[10px]">
        {label}
      </div>
    </div>
  );
}
