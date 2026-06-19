"use client";

import { GitBranch, Globe, Mail, Boxes, Sparkles } from "lucide-react";
import Link from "next/link";
import { Container } from "./layout";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Product tour", href: "#product-tour" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "mailto:hello@smartinv.app" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "API reference", href: "#" },
      { label: "Status", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#06060f]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <Container className="relative">
        <div className="grid grid-cols-2 gap-8 py-14 sm:gap-10 sm:py-16 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                <Boxes className="h-4 w-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-white">
                SmartInv
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              The inventory platform that thinks ahead. Built in Singapore, used
              in 27 countries.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Globe, href: "#", label: "Website" },
                { Icon: GitBranch, href: "#", label: "Git" },
                {
                  Icon: Mail,
                  href: "mailto:hello@smartinv.app",
                  label: "Email",
                },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {c.title}
              </div>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-300 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:items-center sm:text-left">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SmartInv Labs Pte. Ltd. All rights
            reserved.
          </p>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Made for teams who count things.
          </p>
        </div>
      </Container>
    </footer>
  );
}
