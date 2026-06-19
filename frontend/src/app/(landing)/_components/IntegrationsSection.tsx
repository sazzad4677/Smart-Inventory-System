"use client";

import {
  BarChart3,
  Boxes,
  CreditCard,
  Globe,
  Package,
  Plug,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Wallet,
  Webhook,
} from "lucide-react";
import { Container, Section, SectionHeader } from "./layout";
import { StaggerContainer, StaggerItem } from "./motion";

const integrations = [
  { name: "Shopify", icon: ShoppingBag, tag: "Commerce" },
  { name: "Stripe", icon: CreditCard, tag: "Payments" },
  { name: "WooCommerce", icon: ShoppingCart, tag: "Commerce" },
  { name: "QuickBooks", icon: Receipt, tag: "Accounting" },
  { name: "Xero", icon: Wallet, tag: "Accounting" },
  { name: "NetSuite", icon: BarChart3, tag: "ERP" },
  { name: "Amazon", icon: Package, tag: "Marketplace" },
  { name: "Etsy", icon: Globe, tag: "Marketplace" },
  { name: "FedEx", icon: Truck, tag: "Shipping" },
  { name: "DHL", icon: Boxes, tag: "Shipping" },
  { name: "Zapier", icon: Plug, tag: "Automation" },
  { name: "Webhooks", icon: Webhook, tag: "Custom" },
];

export default function IntegrationsSection() {
  return (
    <Section id="integrations" tone="light" bg="grid">
      <Container>
        <SectionHeader
          eyebrow="Integrations"
          eyebrowIcon={<Plug className="h-3.5 w-3.5" />}
          align="center"
          title={
            <>
              Plays nicely with the{" "}
              <span className="text-gradient-brand">
                stack you already have
              </span>
              .
            </>
          }
          description="Native two-way sync with the apps you use. No middleware, no Zapier bills, no ‘it broke at quarter-end.’"
        />

        <StaggerContainer className="mt-12 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((it) => {
            const Icon = it.icon;
            return (
              <StaggerItem key={it.name}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] sm:p-5">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {it.tag}
                    </span>
                  </div>
                  <div className="relative mt-4 text-sm font-semibold text-slate-900 sm:mt-5">
                    {it.name}
                  </div>
                  <div className="relative mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    Connected · 2-way
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <p className="mt-10 text-center text-sm text-slate-500">
          Don’t see what you need?{" "}
          <a
            href="mailto:hello@smartinv.app"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Request an integration →
          </a>
        </p>
      </Container>
    </Section>
  );
}
