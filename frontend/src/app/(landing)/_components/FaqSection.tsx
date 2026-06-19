"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";

const faqs = [
  {
    q: "Do I need to replace my existing ERP?",
    a: "No. SmartInv sits next to it. Most teams keep their ERP for finance and use SmartInv for live operational inventory. Our NetSuite, Xero and QuickBooks integrations keep them in sync.",
  },
  {
    q: "How does the AI forecasting work?",
    a: "We blend 90-day sales velocity, supplier lead times, seasonality, and an in-house transformer trained on anonymized SKU histories. You always see the inputs and can override any decision.",
  },
  {
    q: "Is my data secure?",
    a: "AES-256 at rest, TLS 1.3 in transit, SOC 2 Type II in progress, and daily encrypted backups across two regions. Scale customers can deploy in their own VPC.",
  },
  {
    q: "What does it cost?",
    a: "Starter is free up to 1,000 SKUs. Growth is $39 per workspace per month and unlocks the AI engine. Scale is custom — talk to sales for SSO and VPC options.",
  },
  {
    q: "How long does it take to set up?",
    a: "Median time to first AI-suggested PO is 3h 42m. Most of that is waiting for one CSV import. Bring your own data or start from a sandbox.",
  },
  {
    q: "Can I export my data?",
    a: "Yes — anytime, one click. We support CSV, JSON, and streaming exports to S3, BigQuery, Snowflake, and Datadog. No data hostage tactics.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone="dark" bg="grid">
      <Container size="narrow">
        <SectionHeader
          eyebrow="FAQ"
          align="center"
          title={
            <>
              Questions, <span className="text-gradient-brand">answered</span>.
            </>
          }
          description="The same six we get on every demo. If yours isn’t here, just hit the chat in the bottom right."
        />

        <div className="mt-10 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] ring-soft sm:mt-12">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/[0.02] sm:gap-6 sm:px-6 sm:py-5"
                >
                  <span className="min-w-0 text-sm font-semibold text-white sm:text-base">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                      isOpen
                        ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white"
                        : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-5 text-sm leading-relaxed text-slate-400 sm:px-6 sm:pb-6">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
