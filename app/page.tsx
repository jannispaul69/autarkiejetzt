import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Trust from "@/components/sections/Trust";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Autarkie Jetzt – Kostenlose Solar-Beratung von geprüften Fachbetrieben",
  description:
    "In 60 Sekunden zur kostenfreien Solar-Beratung von geprüften Fachbetrieben aus deiner Region. Unverbindlich, DSGVO-konform.",
  openGraph: {
    title: "Autarkie Jetzt – Endlich unabhängig vom Stromanbieter",
    description:
      "In 60 Sekunden zur kostenfreien Solar-Beratung von geprüften Fachbetrieben aus deiner Region.",
    url: "https://autarkiejetzt.de",
    siteName: "Autarkie Jetzt",
    locale: "de_DE",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main>
      {/* 1. Hero mit eingebettetem Multistep-Form */}
      <Hero />

      {/* 2. Trust-Banner direkt unter dem Hero */}
      <Trust />

      {/* 3. Wie es funktioniert */}
      <HowItWorks />

      {/* 4. Vorteile */}
      <Benefits />

      {/* 5. FAQ */}
      <FAQ />

      {/* 6. Final CTA */}
      <FinalCTA />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
