"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Boxes, Menu, Sparkles, X } from "lucide-react";
import { Container } from "./layout";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#product-tour", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2 sm:py-3" : "py-3 sm:py-5",
      )}
    >
      <Container size="wide">
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-2xl px-3 py-2 transition-all duration-500 sm:px-4 sm:py-2.5 md:px-5",
            scrolled
              ? "glass-dark ring-soft"
              : "bg-transparent ring-1 ring-transparent",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-slate-100"
          >
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)]">
              <Boxes className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
              <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              SmartInv
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex">
            <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-sm text-slate-300 backdrop-blur">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="rounded-full px-3.5 py-1.5 transition hover:bg-white/10 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white md:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              id="nav-get-started"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)] transition hover:shadow-[0_18px_40px_-10px_rgba(236,72,153,0.6)] sm:px-4 sm:text-sm"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">Start free</span>
                <span className="xs:hidden sm:hidden">Start</span>
              </span>
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition group-hover:translate-x-0" />
            </Link>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-100 ring-1 ring-white/10 transition hover:bg-white/10 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 overflow-hidden lg:hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-[#070710]/85 p-3 text-slate-200 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <ul className="flex flex-col">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-white/5"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-white/10 pt-2 space-y-1">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Start free
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-center text-sm font-medium text-slate-300 hover:text-white"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.header>
  );
}
