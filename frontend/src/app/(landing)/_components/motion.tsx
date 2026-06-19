"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  ComponentProps,
  ElementType,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/* ----------------------------------------------------------
   FadeIn — single element reveal on enter
   ---------------------------------------------------------- */
type FadeInProps<T extends ElementType = "div"> = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  className?: string;
  as?: T;
  once?: boolean;
};

export function FadeIn<T extends ElementType = "div">({
  children,
  delay = 0,
  duration = 0.8,
  y = 24,
  x = 0,
  className = "",
  as,
  once = true,
}: FadeInProps<T>) {
  const As = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const MotionTag = motion(As) as unknown as typeof motion.div;
  return (
    <MotionTag
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* ----------------------------------------------------------
   StaggerContainer — children fade in with a stagger
   ---------------------------------------------------------- */
type StaggerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
};

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  stagger = 0.08,
  once = true,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: { delayChildren: delay, staggerChildren: stagger },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------
   Magnetic — pull-toward-cursor wrapper (used on CTAs / logos)
   ---------------------------------------------------------- */
export function Magnetic({
  children,
  strength = 0.25,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------
   CountUp — animate a number from 0 to value
   ---------------------------------------------------------- */
export function CountUp({
  to,
  duration = 1.6,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      // ease-out-quart
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(eased * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ----------------------------------------------------------
   Reveal — paragraph / heading word reveal
   ---------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: string;
  delay?: number;
  className?: string;
}) {
  const words = children.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ----------------------------------------------------------
   Re-export motion.div with a typed alias for ergonomic reuse
   ---------------------------------------------------------- */
export const M = motion as unknown as {
  div: typeof motion.div;
  span: typeof motion.span;
  section: typeof motion.section;
  button: typeof motion.button;
  a: typeof motion.a;
  ul: typeof motion.ul;
  li: typeof motion.li;
  p: typeof motion.p;
  h1: typeof motion.h1;
  h2: typeof motion.h2;
  h3: typeof motion.h3;
};

/* ----------------------------------------------------------
   helper: motion button typed props
   ---------------------------------------------------------- */
export type MotionButtonProps = ComponentProps<typeof motion.button>;
