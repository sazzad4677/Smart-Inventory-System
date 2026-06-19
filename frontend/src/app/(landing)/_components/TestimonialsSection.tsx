"use client";

import { Quote, Star } from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";
import { StaggerContainer, StaggerItem } from "./motion";

const testimonials = [
  {
    quote:
      "We closed Q4 with 31% less dead stock. The AI restock suggestions paid for the entire year of Growth in a single weekend.",
    name: "Maya Okafor",
    role: "Head of Ops · Northwind",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    quote:
      "Replaced four spreadsheets, two meetings, and a custom Zapier chain. The audit log alone was worth the migration.",
    name: "Diego Rivera",
    role: "CFO · Lumen Labs",
    accent: "from-fuchsia-500 to-rose-500",
  },
  {
    quote:
      "The team adopted it on day one. The dashboard actually explains itself, which is rarer than it should be in this category.",
    name: "Priya Shah",
    role: "VP Engineering · Helix",
    accent: "from-cyan-500 to-blue-500",
  },
];

export default function TestimonialsSection() {
  return (
    <Section id="testimonials" tone="light" bg="grid">
      <Container>
        <SectionHeader
          eyebrow="Loved by operators"
          align="center"
          title={
            <>
              What customers <span className="text-gradient-brand">say</span>.
            </>
          }
          description="Three quotes from real humans, not stock photos. Want the long version? Book a 20-minute call with one of them."
        />

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] sm:p-7">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <Quote className="h-6 w-6 text-indigo-400 sm:h-7 sm:w-7" />
                <blockquote className="mt-4 text-[15px] leading-relaxed text-slate-700">
                  “{t.quote}”
                </blockquote>
                <div className="mt-5 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.accent} text-sm font-bold text-white shadow-md`}
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {t.name}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {t.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
