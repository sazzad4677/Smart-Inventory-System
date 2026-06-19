"use client";

import { Check, Minus, X } from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";
import { FadeIn } from "./motion";

type Cell = boolean | "partial";
type Row = { label: string; values: [Cell, Cell, Cell] };
const yes = true;
const no = false;
const partial: Cell = "partial";

const rows: Row[] = [
  { label: "Real-time stock sync", values: [yes, no, partial] },
  { label: "AI restock forecasts", values: [yes, no, no] },
  { label: "Multi-warehouse support", values: [yes, no, yes] },
  { label: "Role-based access control", values: [yes, no, yes] },
  { label: "Native supplier portal", values: [yes, no, no] },
  { label: "Immutable audit log", values: [yes, no, partial] },
  { label: "Two-way Stripe + Shopify", values: [yes, no, partial] },
  { label: "Setup time", values: [yes, partial, no] },
  { label: "Starts at", values: [yes, yes, no] },
];

function Cell({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === true) {
    return (
      <span
        className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${
          highlight
            ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40"
            : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-white/5 text-slate-500 ring-1 ring-white/10">
        <X className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

export default function ComparisonSection() {
  return (
    <Section id="compare" tone="dark" bg="mesh">
      <Container size="narrow">
        <SectionHeader
          eyebrow="How we compare"
          align="center"
          title={
            <>
              The old way vs. the{" "}
              <span className="text-gradient-brand">SmartInv way</span>.
            </>
          }
          description="Side-by-side with the two paths you’ve probably been considering. One costs you your evenings."
        />

        <FadeIn y={20}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] ring-soft">
            <div className="hidden border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:grid sm:grid-cols-12">
              <div className="col-span-5">Capability</div>
              <div className="col-span-7 grid grid-cols-3 text-center">
                <div className="text-white">SmartInv</div>
                <div>Spreadsheets</div>
                <div>Legacy ERP</div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-1 gap-3 px-5 py-4 text-sm transition hover:bg-white/[0.02] sm:grid-cols-12 sm:gap-0"
                >
                  <div className="text-slate-200 sm:col-span-5">{r.label}</div>
                  <div className="grid grid-cols-3 items-center gap-3 sm:col-span-7 sm:gap-0">
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:hidden">
                        SmartInv
                      </span>
                      <Cell value={r.values[0]} highlight />
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:hidden">
                        Sheets
                      </span>
                      <Cell value={r.values[1]} />
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:hidden">
                        ERP
                      </span>
                      <Cell value={r.values[2]} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-3 px-5 py-5 text-sm sm:grid-cols-12 sm:gap-0">
                <div className="sm:col-span-5"></div>
                <div className="grid grid-cols-3 items-center text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500 sm:col-span-7">
                  <span className="text-white">from $0</span>
                  <span>$0 + your sanity</span>
                  <span>$$$$$</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
