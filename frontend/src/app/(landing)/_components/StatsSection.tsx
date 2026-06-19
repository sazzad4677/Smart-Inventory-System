"use client";

import { Container, Section, SectionHeader } from "./layout";
import { CountUp, FadeIn, StaggerContainer, StaggerItem } from "./motion";

const stats = [
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime SLA",
    desc: "Multi-region active-active",
  },
  {
    value: 10284,
    suffix: "+",
    label: "Active SKUs",
    desc: "Tracked on average per workspace",
  },
  {
    value: 200,
    suffix: "ms",
    label: "p95 latency",
    desc: "From event to dashboard",
  },
  {
    value: 14,
    suffix: " days",
    label: "Forecast horizon",
    desc: "AI demand prediction",
  },
];

export default function StatsSection() {
  return (
    <Section tone="light" bg="grid">
      <Container>
        <SectionHeader
          eyebrow="By the numbers"
          align="center"
          title={
            <>
              Quietly powerful,{" "}
              <span className="text-gradient-brand">measurably fast</span>.
            </>
          }
          description="The numbers below come from anonymized production telemetry across all paid workspaces in the last 30 days."
        />

        <StaggerContainer className="mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] sm:p-6">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 blur-2xl transition group-hover:scale-125" />
                <div className="relative text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  <CountUp to={s.value} duration={1.6} />
                  <span className="text-gradient-brand">{s.suffix}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-800 sm:mt-3">
                  {s.label}
                </div>
                <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.15}>
          <p className="mt-8 text-center text-xs text-slate-400">
            * Aggregated, anonymized — your numbers will vary. But not by much.
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}
