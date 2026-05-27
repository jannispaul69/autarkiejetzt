import type { Metadata } from "next";
import SolarCheckHero from "@/components/sections/SolarCheckHero";
import Trust from "@/components/sections/Trust";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Solar-Check – Deine persönliche Solaranalyse | Autarkie Jetzt",
  description:
    "In 3 Minuten erfährst du, ob und wie viel du mit einer Solaranlage sparen kannst. Detaillierte Analyse, 100% kostenlos.",
  openGraph: {
    title: "Solar-Check – Deine persönliche Solaranalyse",
    description:
      "In 3 Minuten erfährst du, ob und wie viel du mit einer Solaranlage sparen kannst – plus kostenlose Beratung von einem Experten.",
    url: "https://autarkiejetzt.de/solar-check",
    siteName: "Autarkie Jetzt",
    locale: "de_DE",
    type: "website",
  },
};

export default function SolarCheckPage() {
  return (
    <main>
      {/* 1. Hero mit eingebettetem Solar-Check-Formular */}
      <SolarCheckHero />

      {/* 2–7. Shared sections from main landing page */}
      <Trust />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
