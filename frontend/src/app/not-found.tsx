"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">
        {/* Simplified Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full" />
          <h1 className="text-9xl font-black tracking-tighter text-white/10 select-none">
            404
          </h1>
          <h2 className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white mt-4">
            Page Not Found
          </h2>
        </div>

        {/* Focused Message */}
        <p className="text-slate-400 text-lg leading-relaxed">
          The requested shelf is empty or doesn&apos;t exist. Let&apos;s get
          your inventory management back on track.
        </p>

        {/* Clear Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2",
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-14 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </div>

        {/* Core Quick Links */}
        <div className="pt-8 border-t border-white/5 w-full grid grid-cols-2 gap-4">
          <Link
            href="/inventory"
            className="text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors"
          >
            Inventory
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors"
          >
            Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
