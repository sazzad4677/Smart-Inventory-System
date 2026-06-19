"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeader } from "./layout";
import { FadeIn, StaggerContainer, StaggerItem } from "./motion";

type Plan = {
  name: string;
  blurb: string;
  price: string;
  suffix?: string;
  highlight?: boolean;
  cta: { label: string; href: string };
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    blurb: "Solo founders and tiny warehouses.",
    price: "$0",
    suffix: "/mo",
    cta: { label: "Start free", href: "/login" },
    features: [
      "1 workspace · 1 warehouse",
      "1,000 SKUs",
      "Real-time dashboard",
      "CSV import / export",
      "Community support",
    ],
  },
  {
    name: "Growth",
    blurb: "Most loved by 2–25 person teams.",
    price: "$39",
    suffix: "/mo per workspace",
    highlight: true,
    cta: { label: "Start 14-day trial", href: "/login" },
    features: [
      "Up to 10 warehouses",
      "Unlimited SKUs",
      "AI restock forecasts",
      "Role-based access control",
      "Shopify, Stripe, QBO sync",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    blurb: "High volume and regulated industries.",
    price: "Custom",
    cta: { label: "Talk to sales", href: "mailto:sales@smartinv.app" },
    features: [
      "Unlimited everything",
      "SSO / SCIM provisioning",
      "On-prem or VPC deploy",
      "SOC 2 Type II report",
      "Dedicated success manager",
      "99.99% uptime SLA",
    ],
  },
];

export default function PricingSection() {
  return (
    <Section id="pricing" tone="dark" bg="mesh" withGlow>
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
          align="center"
          title={
            <>
              Simple plans,{" "}
              <span className="text-gradient-brand">serious value</span>.
            </>
          }
          description="Start free, upgrade when you outgrow it. No per-seat tax, no setup fees, no surprise annual escalators."
        />

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:mt-16 lg:grid-cols-3">
          {plans.map((p) => (
            <StaggerItem key={p.name}>
              <div
                className={`relative h-full overflow-hidden rounded-2xl border p-5 transition sm:p-7 ${
                  p.highlight
                    ? "border-white/15 bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent ring-1 ring-violet-400/20"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {p.highlight && (
                  <>
                    <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-64 w-[480px] -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg sm:right-5 sm:top-5">
                      <Sparkles className="h-3 w-3" /> most popular
                    </span>
                  </>
                )}

                <div className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  {p.name}
                </div>
                <p className="mt-2 text-sm text-slate-400">{p.blurb}</p>

                <div className="mt-5 flex items-baseline gap-1 sm:mt-6">
                  <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {p.price}
                  </span>
                  {p.suffix && (
                    <span className="text-sm font-medium text-slate-400">
                      {p.suffix}
                    </span>
                  )}
                </div>

                <Link
                  href={p.cta.href}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition sm:mt-6 ${
                    p.highlight
                      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_18px_40px_-15px_rgba(139,92,246,0.7)] hover:shadow-[0_22px_50px_-15px_rgba(236,72,153,0.7)]"
                      : "border border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  }`}
                >
                  {p.cta.label}
                </Link>

                <ul className="mt-6 space-y-3 text-sm sm:mt-7">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-slate-200"
                    >
                      <span
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                          p.highlight
                            ? "bg-gradient-to-br from-indigo-400 to-fuchsia-400"
                            : "bg-white/10"
                        }`}
                      >
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.15}>
          <p className="mt-10 text-center text-sm text-slate-400">
            All plans include unlimited team members, daily backups, and 256-bit
            encryption at rest.
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}
