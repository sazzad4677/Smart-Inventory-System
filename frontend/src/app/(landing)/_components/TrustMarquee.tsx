"use client";

import { motion } from "framer-motion";
import { Container } from "./layout";

const logos = [
  "Northwind",
  "Acme Co.",
  "Lumen Labs",
  "Helix",
  "Forge & Co",
  "Atlas Outfitters",
  "Nimbus",
  "Vertex",
  "Quanta",
  "Polaroid",
];

export default function TrustMarquee() {
  return (
    <section className="relative border-y border-white/5 bg-[#070710] py-8 sm:py-10 md:py-12">
      <Container>
        <div className="flex flex-col items-center gap-5 text-center sm:gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
            Trusted by inventory teams at
          </p>

          <div
            className="relative w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <motion.div
              className="flex w-max gap-10 py-2 sm:gap-14"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...logos, ...logos].map((name, i) => (
                <Logo key={`${name}-${i}`} name={name} />
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Logo({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 text-slate-400 transition hover:text-slate-200">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-md bg-white/[0.04] text-base font-bold text-white/70 ring-1 ring-white/10"
      >
        {name.charAt(0)}
      </span>
      <span className="text-lg font-semibold tracking-tight">{name}</span>
    </div>
  );
}
