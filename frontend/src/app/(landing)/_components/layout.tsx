import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------
   Container — 1200px max-width, responsive padding
   ---------------------------------------------------------- */
export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const widths = {
    default: "max-w-7xl",
    wide: "max-w-[88rem]",
    narrow: "max-w-5xl",
  };
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 md:px-8",
        widths[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------
   Section — themed wrapper (dark/light) with optional bg
   ---------------------------------------------------------- */
type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "dark" | "light";
  bg?: "mesh" | "grid" | "plain" | "aurora" | "dots";
  withGlow?: boolean;
};

export function Section({
  id,
  className = "",
  children,
  tone = "dark",
  bg = "plain",
  withGlow = false,
}: SectionProps) {
  const isDark = tone === "dark";
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        "py-16 sm:py-20 md:py-24 lg:py-32 xl:py-36",
        isDark ? "text-slate-100" : "text-slate-900",
        bg === "mesh" && isDark && "bg-mesh-dark",
        bg === "mesh" && !isDark && "bg-slate-50",
        bg === "grid" && isDark && "bg-[#05060f] bg-grid-dark",
        bg === "grid" && !isDark && "bg-white bg-grid-light",
        bg === "plain" && isDark && "bg-[#05060f]",
        bg === "plain" && !isDark && "bg-slate-50",
        bg === "dots" && isDark && "bg-[#05060f]",
        bg === "dots" && !isDark && "bg-white",
        className,
      )}
    >
      {bg === "aurora" && isDark && <AuroraBg />}
      {bg === "aurora" && !isDark && <AuroraBgLight />}
      {bg === "dots" && <DotsBg tone={tone} />}
      {withGlow && <CenterGlow tone={tone} />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------
   Section header — eyebrow + title + subtitle
   ---------------------------------------------------------- */
export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  align = "center",
  tone = "dark",
  className = "",
}: {
  eyebrow: string;
  eyebrowIcon?: ReactNode;
  title: ReactNode;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase",
          isDark
            ? "border border-white/10 bg-white/[0.04] text-indigo-200 shadow-[0_0_24px_-6px_rgba(99,102,241,0.45)]"
            : "border border-indigo-200 bg-indigo-50 text-indigo-700",
        )}
      >
        {eyebrowIcon}
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-5 sm:mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl",
          isDark ? "text-white" : "text-slate-900",
        )}
      >
        {title}{" "}
        {highlight && (
          <span
            className={isDark ? "text-gradient-brand" : "text-gradient-light"}
          >
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 sm:mt-5 text-base sm:text-lg md:text-xl leading-relaxed",
            isDark ? "text-slate-400" : "text-slate-600",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------
   Decorative backgrounds
   ---------------------------------------------------------- */
function AuroraBg() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#05060f]" />
      <div className="pointer-events-none absolute -top-40 -left-40 -z-0 h-[520px] w-[520px] rounded-full bg-indigo-500/30 blur-[120px] animate-pulse-soft" />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 -z-0 h-[520px] w-[520px] rounded-full bg-pink-500/25 blur-[140px] animate-pulse-soft"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[140px] animate-pulse-soft"
        style={{ animationDelay: "0.6s" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-0 bg-grid-dark opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </>
  );
}

function AuroraBgLight() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white" />
      <div className="pointer-events-none absolute -top-40 -left-40 -z-0 h-[520px] w-[520px] rounded-full bg-indigo-300/40 blur-[120px] animate-pulse-soft" />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 -z-0 h-[520px] w-[520px] rounded-full bg-pink-300/30 blur-[140px] animate-pulse-soft"
        style={{ animationDelay: "1.4s" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-300/30 blur-[140px] animate-pulse-soft"
        style={{ animationDelay: "0.6s" }}
      />
    </>
  );
}

function DotsBg({ tone }: { tone: "dark" | "light" }) {
  const color =
    tone === "dark" ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-0"
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        maskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  );
}

function CenterGlow({ tone }: { tone: "dark" | "light" }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[640px] w-[840px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
        tone === "dark" ? "bg-indigo-500/15" : "bg-indigo-300/30",
      )}
    />
  );
}

/* ----------------------------------------------------------
   Badge — small inline pill
   ---------------------------------------------------------- */
export function Badge({
  children,
  className = "",
  tone = "dark",
  variant = "solid",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
  variant?: "solid" | "outline" | "gradient";
}) {
  const isDark = tone === "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        variant === "solid" &&
          (isDark
            ? "bg-white/[0.05] text-slate-200 ring-1 ring-inset ring-white/10"
            : "bg-slate-900 text-white"),
        variant === "outline" &&
          (isDark
            ? "ring-1 ring-inset ring-white/15 text-slate-200"
            : "ring-1 ring-inset ring-slate-300 text-slate-700"),
        variant === "gradient" &&
          "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_8px_24px_-12px_rgba(139,92,246,0.6)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
