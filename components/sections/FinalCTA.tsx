"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  function scrollToForm() {
    const el = document.getElementById("hero-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section
      className="py-20 lg:py-28"
      style={{ backgroundColor: "#0A4D3C" }}
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-3">
            <h2
              id="final-cta-heading"
              className="font-heading text-white tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}
            >
              Bereit für deine eigene Solaranlage?
            </h2>
            <p className="text-white/75 text-lg leading-relaxed max-w-xl mx-auto">
              Starte jetzt unverbindlich – in 60 Sekunden zur kostenlosen Beratung.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
            style={{ backgroundColor: "#F4B400", color: "#0A4D3C" }}
          >
            Jetzt kostenlos anfragen →
          </button>

          <p className="text-white/50 text-xs">
            Keine Weitergabe an Dritte · Kostenlos & unverbindlich · DSGVO-konform
          </p>
        </motion.div>
      </div>
    </section>
  );
}
