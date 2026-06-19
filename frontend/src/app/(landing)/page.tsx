import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import TrustMarquee from "./_components/TrustMarquee";
import FeaturesSection from "./_components/FeaturesSection";
import ProductTourSection from "./_components/ProductTourSection";
import HowItWorksSection from "./_components/HowItWorksSection";
import StatsSection from "./_components/StatsSection";
import ComparisonSection from "./_components/ComparisonSection";
import IntegrationsSection from "./_components/IntegrationsSection";
import PricingSection from "./_components/PricingSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import FaqSection from "./_components/FaqSection";
import CtaSection from "./_components/CtaSection";
import Footer from "./_components/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#06060f] text-slate-100 antialiased">
      <Navbar />
      <HeroSection />
      <TrustMarquee />
      <FeaturesSection />
      <ProductTourSection />
      <HowItWorksSection />
      <StatsSection />
      <ComparisonSection />
      <IntegrationsSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
