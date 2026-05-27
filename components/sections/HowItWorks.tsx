"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Formular ausfüllen",
    description:
      "In 60 Sekunden deine Wohnsituation, deinen Verbrauch und deinen Standort angeben. Ohne Registrierung, ohne Verpflichtung.",
  },
  {
    number: "02",
    title: "Angebot erhalten",
    description:
      "Ein geprüfter Solar-Fachbetrieb aus deiner Region nimmt sich deiner Anfrage an und meldet sich innerhalb von 24 Stunden bei dir.",
  },
  {
    number: "03",
    title: "Entscheidung treffen",
    description:
      "Besprich dein individuelles Angebot – kostenlos und ohne Kaufverpflichtung. Du entscheidest, wann und ob du startest.",
  },
] as const;


export default function HowItWorks() {
  return (
    <section className="bg-brand-surface py-20 lg:py-28" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="text-center mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-primary mb-3">
            So funktioniert es
          </p>
          <h2
            id="how-it-works-heading"
            className="font-heading text-brand-text tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}
          >
            In drei Schritten zur Solaranlage
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">

          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-8 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-brand-border"
            aria-hidden="true"
          />

          {STEPS.map(({ number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.12 }}
              className="flex flex-col items-start lg:items-center text-left lg:text-center gap-4"
            >
              {/* Number bubble */}
              <div className="relative flex-shrink-0">
                <span
                  className="font-heading text-5xl font-extrabold text-brand-primary leading-none select-none"
                  aria-hidden="true"
                >
                  {number}
                </span>
                {/* Dot on the connector line */}
                <span className="hidden lg:block absolute -bottom-[1.85rem] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-primary border-2 border-brand-surface" />
              </div>

              <div className="flex flex-col gap-2 pt-2 lg:pt-6">
                <h3 className="font-heading text-lg font-bold text-brand-text">{title}</h3>
                <p className="text-brand-text-muted text-[0.9375rem] leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
