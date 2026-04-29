"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white border border-white/10 shadow-[0_0_30px_rgba(96,96,255,0.35)] hover:shadow-[0_0_40px_rgba(150,70,255,0.45)]",
  secondary: "bg-white/5 text-white border border-white/25 hover:bg-white/10",
  ghost:
    "bg-transparent text-slate-200 hover:text-white hover:bg-white/5 border border-transparent",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:pointer-events-none disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
