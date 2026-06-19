"use client";

import { ArrowRight, Boxes, Rocket, Wand2 } from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";
import { FadeIn, StaggerContainer, StaggerItem } from "./motion";

const steps = [
  {
    icon: Boxes,
    eyebrow: "Step 01",
    title: "Import your catalog",
    body: "Drop in a CSV, sync from Shopify, or import via API. We auto-map SKUs, costs, and categories in seconds.",
  },
  {
    icon: Wand2,
    eyebrow: "Step 02",
    title: "Connect your channels",
    body: "Hook up sales, suppliers and accounting. SmartInv listens to every event and builds a single timeline.",
  },
  {
    icon: Rocket,
    eyebrow: "Step 03",
    title: "Let the AI run the rest",
    body: "Restock suggestions, demand forecasts and weekly briefings arrive in your inbox — no spreadsheets required.",
  },
];

export default function HowItWorksSection() {
  return (
    <Section id="how-it-works" tone="dark" bg="grid" withGlow>
      <Container>
        <SectionHeader
          eyebrow="How it works"
          eyebrowIcon={<Wand2 className="h-3.5 w-3.5" />}
          align="center"
          title={
            <>
              Live in <span className="text-gradient-brand">one afternoon</span>
              .
            </>
          }
          description="From signup to your first AI-suggested PO in under four hours. No consultants, no migrations."
        />

        <StaggerContainer className="relative mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 lg:mt-16 lg:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px lg:block">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="absolute inset-0 h-full animate-[grid-drift_6s_linear_infinite] bg-[linear-gradient(to_right,transparent_0,rgba(99,102,241,0.6)_50%,transparent_100%)] bg-[length:200%_100%]" />
          </div>

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 ring-soft transition hover:bg-white/[0.04] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {s.eyebrow}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-white sm:mt-6">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
                    {s.body}
                  </p>

                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute right-4 top-4 hidden h-4 w-4 text-slate-600 lg:block" />
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:mt-14">
            <p className="text-sm text-slate-400">
              Average time to first value:{" "}
              <span className="font-semibold text-white">3h 42m</span>
            </p>
            <div className="h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-white/5 sm:w-64">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 animate-[shimmer-x_3s_linear_infinite] bg-[length:200%_100%]" />
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
