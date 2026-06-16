import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import APISection from "@/components/sections/APISection";
import VoiceFoundry from "@/components/sections/VoiceFoundry";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";

export default function Page() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="w-full">
        <Hero />
        <Features />
        <HowItWorks />
        <APISection />
        <VoiceFoundry />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
