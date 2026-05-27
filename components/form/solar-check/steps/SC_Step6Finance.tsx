"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Banknote, Building, ClipboardList, HelpCircle } from "lucide-react";

type FinancingType = "cash" | "financing" | "leasing" | "unknown";
type PreviousConsultation = "none" | "want_second" | "had_offer";

interface Props {
  onComplete: (data: { financing_type: FinancingType; previous_consultation: PreviousConsultation }) => void;
  onBack: () => void;
  defaultValues?: { financing_type?: FinancingType; previous_consultation?: PreviousConsultation };
}

const FINANCE_OPTIONS: { value: FinancingType; label: string; hint?: string; Icon: LucideIcon }[] = [
  { value: "cash",       label: "Barzahlung",           hint: "Kein Kredit",  Icon: Banknote     },
  { value: "financing",  label: "Finanzierung / Kredit",                      Icon: Building     },
  { value: "leasing",    label: "Leasing / Miete",                            Icon: ClipboardList },
  { value: "unknown",    label: "Noch nicht entschieden",                     Icon: HelpCircle   },
];

const CONSULTATION_OPTIONS: { value: PreviousConsultation; label: string }[] = [
  { value: "none",        label: "Nein, noch nicht" },
  { value: "want_second", label: "Ja, aber ich möchte ein zweites Angebot" },
  { value: "had_offer",   label: "Ja, ich hatte ein Angebot (zu teuer / unpassend)" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function SC_Step6Finance({ onComplete, onBack, defaultValues }: Props) {
  const [financing, setFinancing] = useState<FinancingType | null>(defaultValues?.financing_type ?? null);
  const [consultation, setConsultation] = useState<PreviousConsultation | null>(
    defaultValues?.previous_consultation ?? null,
  );

  const canProceed = financing !== null && consultation !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Q1: Finanzierung */}
      <div className="flex flex-col gap-3">
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Wie möchtest du die Anlage finanzieren?
        </p>
        <motion.div
          className="grid grid-cols-2 gap-2.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {FINANCE_OPTIONS.map(({ value, label, hint, Icon }) => {
            const isSelected = financing === value;
            return (
              <motion.button
                key={value}
                type="button"
                variants={cardVariants}
                onClick={() => setFinancing(value)}
                whileTap={{ scale: 0.97 }}
                aria-pressed={isSelected}
                className={[
                  "flex items-start gap-3 w-full p-3.5 rounded-xl border-2 text-left",
                  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-brand-border hover:border-brand-primary/40 hover:bg-brand-primary/[0.03]",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors mt-0.5",
                    isSelected ? "bg-brand-primary/10 text-brand-primary" : "bg-[#F4F4F2] text-brand-text-muted",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-brand-text text-sm leading-snug">{label}</span>
                  {hint && <span className="text-xs text-brand-text-muted mt-0.5">{hint}</span>}
                </div>
                {isSelected && (
                  <span className="ml-auto flex-shrink-0 pt-0.5" aria-hidden="true">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      {/* Q2: Vorige Beratung */}
      <div className="flex flex-col gap-3">
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Hattest du schon eine Beratung?
        </p>
        <div className="flex flex-col gap-2">
          {CONSULTATION_OPTIONS.map(({ value, label }) => {
            const isSelected = consultation === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setConsultation(value)}
                aria-pressed={isSelected}
                className={[
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left",
                  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-brand-border hover:border-brand-primary/40 hover:bg-brand-primary/[0.03]",
                ].join(" ")}
              >
                {/* Radio indicator */}
                <span
                  className={[
                    "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-brand-primary" : "border-brand-border",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  )}
                </span>
                <span className="text-sm text-brand-text">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          canProceed &&
          onComplete({ financing_type: financing!, previous_consultation: consultation! })
        }
        disabled={!canProceed}
        className={[
          "w-full py-3.5 px-6 rounded-xl font-medium text-base transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          canProceed
            ? "bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.99] cursor-pointer"
            : "bg-brand-border text-brand-text-muted cursor-not-allowed",
        ].join(" ")}
      >
        Weiter →
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-brand-text-muted hover:text-brand-text transition-colors text-center focus-visible:outline-none focus-visible:underline"
      >
        ← Zurück
      </button>
    </div>
  );
}
