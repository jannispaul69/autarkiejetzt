"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    emoji: "☀️",
    title: "Stromkosten dauerhaft senken",
    description:
      "Eine PV-Anlage erzeugt deinen eigenen Strom. Weniger Abhängigkeit vom Netz, spürbar niedrigere Jahreskosten.",
  },
  {
    emoji: "🏠",
    title: "Unabhängig vom Stromanbieter",
    description:
      "Erzeuge deinen eigenen Strom und schütz dich langfristig vor weiteren Preissteigerungen.",
  },
  {
    emoji: "🔋",
    title: "Bis zu 80 % Eigenverbrauch",
    description:
      "Mit einem Stromspeicher nutzt du tagsüber gewonnene Energie auch abends und nachts.",
  },
  {
    emoji: "🌱",
    title: "Gut fürs Klima",
    description:
      "Jede selbst erzeugte kWh schont die Umwelt und reduziert deinen persönlichen CO₂-Fußabdruck.",
  },
  {
    emoji: "📈",
    title: "Immobilienwert steigern",
    description:
      "Eine PV-Anlage erhöht den Wert deiner Immobilie – ein echtes Plus beim Wiederverkauf.",
  },
  {
    emoji: "🔒",
    title: "Fachbetrieb mit Garantie",
    description:
      "Alle Partnerbetriebe sind geprüft, versichert und bieten Montage- sowie Produktgarantien.",
  },
] as const;


export default function Benefits() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{ backgroundColor: "#F5F5F0" }}
      aria-labelledby="benefits-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-primary mb-3">
            Deine Vorteile
          </p>
          <h2
            id="benefits-heading"
            className="font-heading text-brand-text tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}
          >
            Warum jetzt der richtige Moment ist
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map(({ emoji, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.38, ease: "easeOut", delay: i * 0.07 }}
              className="group bg-white rounded-2xl p-6 border border-brand-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl mb-4 block" role="img" aria-hidden="true">
                {emoji}
              </span>
              <h3 className="font-heading font-bold text-brand-text text-base mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-brand-text-muted text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
