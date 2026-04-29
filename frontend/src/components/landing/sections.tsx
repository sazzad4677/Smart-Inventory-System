"use client";

import {
  BarChart3,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="font-bold">Smart Inventory</div>
        <nav className="hidden gap-8 md:flex text-sm text-slate-300">
          {["Features", "How It Works", "Screenshots", "Pricing", "FAQ"].map(
            (i) => (
              <a key={i} href={`#${i.toLowerCase().replace(/ /g, "-")}`}>
                {i}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-4 py-2 text-sm">
            Login
          </Button>
          <Button className="px-5 py-2 text-sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 md:grid-cols-2">
      <div className="space-y-7">
        <Badge>
          <Sparkles className="h-3 w-3" />
          Smart. Simple. Powerful.
        </Badge>
        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Control Your Inventory{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            in Real Time
          </span>
        </h1>
        <p className="max-w-xl text-lg text-slate-300">
          Track stock, manage products, and prevent shortages with one powerful
          dashboard built for modern teams.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="min-w-44">Get Started Free</Button>
          <Button variant="secondary" className="min-w-40">
            Live Demo
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 text-slate-300">
          {["No credit card", "Easy setup", "Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-purple-400/40 bg-slate-900 p-3 shadow-[0_0_90px_rgba(117,84,255,0.35)] animate-[float_6s_ease-in-out_infinite]">
          <div className="h-[370px] rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
            <div className="grid grid-cols-3 gap-4">
              {["1,240", "24,560", "$56,430"].map((x) => (
                <Card key={x} className="p-4">
                  <p className="text-xs text-slate-400">Metric</p>
                  <p className="text-xl font-bold">{x}</p>
                </Card>
              ))}
            </div>
            <div className="mt-4 h-56 rounded-xl border border-white/5 bg-slate-950/80" />
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-3xl" />
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    "500+ Happy Users",
    "50K+ Products Managed",
    "99.9% Uptime",
    "100% Secure",
  ];
  return (
    <section className="mx-auto mt-14 grid max-w-7xl gap-4 px-6 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s}
          className="transition-transform duration-300 hover:-translate-y-1.5"
        >
          <Card className="p-6">
            <p className="text-3xl font-bold">{s.split(" ")[0]}</p>
            <p className="mt-1 text-slate-300">
              {s.replace(s.split(" ")[0] + " ", "")}
            </p>
          </Card>
        </div>
      ))}
    </section>
  );
}

export function Features() {
  const f = [
    "Real-time Stock Tracking",
    "Low Stock Alerts",
    "Multi-user Roles",
    "Analytics Dashboard",
    "Fast & Responsive",
    "Secure & Reliable",
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <Badge>Features</Badge>
        <h2 className="mt-5 text-4xl font-bold">
          Everything You Need to Manage Inventory{" "}
          <span className="text-blue-400">Effortlessly</span>
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {f.map((x, i) => (
          <div
            key={x}
            className="transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01]"
          >
            <Card
              className={`p-6 ${i === 1 ? "border-purple-400/40 bg-purple-500/10" : ""}`}
            >
              <p className="font-semibold">{x}</p>
              <p className="mt-2 text-sm text-slate-300">
                Built to keep operations smooth with clear visibility and
                controls.
              </p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Screenshots() {
  const shots = [
    "Products Management",
    "Add & Edit Products",
    "Analytics & Reports",
  ];
  const [idx, setIdx] = useState(0);
  return (
    <section id="screenshots" className="border-y border-white/5 py-18">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <Badge>Screenshots</Badge>
          <h2 className="mt-4 text-4xl font-bold">
            A Clean & Modern Interface
          </h2>
        </div>
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => setIdx((idx + shots.length - 1) % shots.length)}
          >
            <ChevronLeft />
          </button>
          <div key={idx} className="flex-1 transition-all duration-500">
            <Card className="p-3">
              <div className="h-72 rounded-xl border border-purple-300/30 bg-slate-950" />
              <p className="mt-4 text-center font-semibold">{shots[idx]}</p>
            </Card>
          </div>
          <button onClick={() => setIdx((idx + 1) % shots.length)}>
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    [UserPlus, "Create Account"],
    [Box, "Add Inventory"],
    [BarChart3, "Start Managing"],
  ] as const;
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <Badge>How It Works</Badge>
        <h2 className="mt-4 text-4xl font-bold">
          Get Started in 3 Simple Steps
        </h2>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map(([I, t], i) => (
          <Card key={t} className="relative p-6">
            <I className="mb-4 h-10 w-10 text-purple-300" />
            <p className="font-semibold">
              {i + 1}. {t}
            </p>
            <p className="text-slate-300">
              Simple onboarding and delightful workflows.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 to-purple-700 p-10">
        <h3 className="text-4xl font-bold">
          Ready to take control of your inventory?
        </h3>
        <div className="mt-6 flex gap-4">
          <Button className="bg-white text-indigo-700 hover:bg-white/90">
            Get Started Free
          </Button>
          <Button variant="secondary">Live Demo</Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-5 text-slate-300">
      <div>
        <p className="text-xl font-bold text-white">Smart Inventory</p>
        <p className="mt-3 text-sm">Modern inventory management system.</p>
      </div>
      <div>
        <p className="font-semibold text-white">Product</p>
      </div>
      <div>
        <p className="font-semibold text-white">Company</p>
      </div>
      <div>
        <p className="font-semibold text-white">Support</p>
      </div>
      <div>
        <p className="font-semibold text-white">Newsletter</p>
        <input
          className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3"
          placeholder="Enter your email"
        />
      </div>
    </footer>
  );
}
