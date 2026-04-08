"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ErrorView } from "@/components/shared/ErrorView";
import "../app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="h-full min-h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden">
        <div className="flex min-h-screen w-full items-center justify-center p-4">
          <ErrorView error={error} reset={reset} isGlobal={true} />
        </div>
      </body>
    </html>
  );
}
