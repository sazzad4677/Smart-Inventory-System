import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Inventory System — AI-Powered Inventory Management",
  description:
    "Enterprise-grade inventory management with real-time tracking, AI analytics, automated restock alerts, and role-based access control. Built for modern teams.",
  keywords: [
    "inventory management",
    "SaaS",
    "real-time tracking",
    "AI analytics",
    "stock management",
    "order management",
  ],
  openGraph: {
    title: "Smart Inventory System — AI-Powered Inventory Management",
    description:
      "Enterprise-grade inventory management with real-time tracking, AI analytics, and automated restock alerts.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
