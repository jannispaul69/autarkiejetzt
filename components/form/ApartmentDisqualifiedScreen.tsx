"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function ApartmentDisqualifiedScreen({ onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-5 py-2"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary/10">
        <Building2 className="w-8 h-8 text-brand-primary" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-brand-text text-[1.0625rem] leading-snug">
          Für Ihre Wohnung passt eine andere Lösung
        </p>
        <p className="text-brand-text-muted text-sm leading-relaxed text-left">
          Eine klassische Photovoltaikanlage auf dem Dach ist für Eigentumswohnungen
          leider nicht möglich, da Sie keinen alleinigen Zugang zum Gemeinschaftsdach haben.
        </p>
        <p className="text-brand-text-muted text-sm leading-relaxed text-left">
          Für Ihre Wohnung empfehlen wir ein Balkonkraftwerk –
          einfach aufzustellen, kein Handwerker nötig.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 w-full pt-1">
        <a
          href="https://www.google.com/search?q=balkonkraftwerk+kaufen"
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "w-full py-3.5 px-6 rounded-xl font-medium text-base text-center",
            "bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          ].join(" ")}
        >
          Mehr über Balkonkraftwerke erfahren
        </a>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors focus-visible:outline-none focus-visible:underline"
        >
          ← Zurück zur Auswahl
        </button>
      </div>
    </motion.div>
  );
}
