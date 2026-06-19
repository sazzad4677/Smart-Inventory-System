"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container, Section } from "./layout";
import { FadeIn } from "./motion";

export default function CtaSection() {
  return (
    <Section tone="light" bg="grid" withGlow>
      <Container>
        <FadeIn y={20}>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_40px_80px_-40px_rgba(15,23,42,0.2)] sm:p-10 md:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-90"
              style={{
                background:
                  "radial-gradient(60% 60% at 20% 20%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(60% 60% at 80% 80%, rgba(236,72,153,0.18), transparent 60%)",
              }}
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              14-day free trial · no credit card
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-6 sm:text-4xl md:text-5xl">
              Ready to retire the spreadsheet?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Join the teams who close their books faster, sleep deeper, and
              finally trust the number on the dashboard.
            </p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center sm:flex-wrap">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 sm:px-6 sm:py-3.5"
              >
                Start your free trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="mailto:sales@smartinv.app"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:py-3.5"
              >
                Book a 20-min demo
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 sm:mt-8">
              <span>✓ Cancel anytime</span>
              <span>✓ SOC 2 ready</span>
              <span>✓ Migration help included</span>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
