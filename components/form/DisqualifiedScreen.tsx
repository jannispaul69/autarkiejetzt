"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function DisqualifiedScreen({ onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-5 py-2"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-50">
        <XCircle className="w-8 h-8 text-orange-400" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="font-semibold text-brand-text text-[1.0625rem] leading-snug">
          Leider können wir dir aktuell nicht weiterhelfen.
        </p>
        <p className="text-brand-text-muted text-sm leading-relaxed">
          Da du Mieter bist, liegt die Entscheidung bei deinem Eigentümer.
          Tipp: Sprich ihn darauf an – viele Vermieter installieren PV auf Anfrage.
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline-none focus-visible:underline"
      >
        ← Zurück
      </button>
    </motion.div>
  );
}
