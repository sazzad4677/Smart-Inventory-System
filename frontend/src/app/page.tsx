import {
  CTA,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
  Screenshots,
  Stats,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <main className="bg-[radial-gradient(circle_at_70%_20%,rgba(143,92,255,0.2),transparent_30%),radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.2),transparent_25%)]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Screenshots />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
