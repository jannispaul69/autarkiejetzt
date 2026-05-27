"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Zap, Calendar, CalendarDays, BookOpen } from "lucide-react";

type Timeframe = "immediate" | "1_3_months" | "3_6_months" | "info_only";
type Motivation = "cost" | "independence" | "environment" | "property_value" | "storage";

interface Props {
  onComplete: (data: { timeframe: Timeframe; motivations: Motivation[] }) => void;
  onBack: () => void;
  defaultValues?: { timeframe?: Timeframe; motivations?: Motivation[] };
}

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string; badge?: string; Icon: LucideIcon }[] = [
  { value: "immediate",   label: "So schnell wie möglich", badge: "🔥 Beliebt", Icon: Zap         },
  { value: "1_3_months",  label: "In 1–3 Monaten",                              Icon: Calendar    },
  { value: "3_6_months",  label: "In 3–6 Monaten",                              Icon: CalendarDays },
  { value: "info_only",   label: "Erstmal nur informieren",                      Icon: BookOpen    },
];

const MOTIVATION_OPTIONS: { value: Motivation; label: string; emoji: string }[] = [
  { value: "cost",           label: "Stromkosten senken",        emoji: "⚡" },
  { value: "independence",   label: "Unabhängig werden",         emoji: "🛡️" },
  { value: "environment",    label: "Umwelt schützen",           emoji: "🌍" },
  { value: "property_value", label: "Immobilienwert steigern",   emoji: "📈" },
  { value: "storage",        label: "Mit Speicher autark werden", emoji: "🔋" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function SC_Step7TimeframeMotivation({ onComplete, onBack, defaultValues }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe | null>(defaultValues?.timeframe ?? null);
  const [motivations, setMotivations] = useState<Motivation[]>(defaultValues?.motivations ?? []);

  const canProceed = timeframe !== null && motivations.length > 0;

  function toggleMotivation(m: Motivation) {
    setMotivations((prev) => {
      if (prev.includes(m)) return prev.filter((x) => x !== m);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, m];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Timeframe */}
      <div className="flex flex-col gap-3">
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Wann möchtest du deine Solaranlage umsetzen?
        </p>
        <motion.div
          className="grid grid-cols-2 gap-2.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {TIMEFRAME_OPTIONS.map(({ value, label, badge, Icon }) => {
            const isSelected = timeframe === value;
            return (
              <motion.button
                key={value}
                type="button"
                variants={cardVariants}
                onClick={() => setTimeframe(value)}
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
                    "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors",
                    isSelected ? "bg-brand-primary/10 text-brand-primary" : "bg-[#F4F4F2] text-brand-text-muted",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-brand-text text-sm leading-snug">{label}</span>
                  {badge && (
                    <span className="mt-1 inline-flex self-start px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      {badge}
                    </span>
                  )}
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

      {/* Motivation multi-select */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-medium text-brand-text text-[0.9375rem]">
            Was ist deine Hauptmotivation?
          </p>
          <span
            className={[
              "text-xs font-medium px-2 py-0.5 rounded-full transition-colors",
              motivations.length > 0
                ? "bg-brand-primary/10 text-brand-primary"
                : "bg-brand-border/60 text-brand-text-muted",
            ].join(" ")}
          >
            {motivations.length}/2 gewählt
          </span>
        </div>
        <p className="text-xs text-brand-text-muted -mt-1">Bis zu 2 auswählen</p>
        <div className="flex flex-col gap-2">
          {MOTIVATION_OPTIONS.map(({ value, label, emoji }) => {
            const isSelected = motivations.includes(value);
            const isDisabled = !isSelected && motivations.length >= 2;
            return (
              <button
                key={value}
                type="button"
                onClick={() => !isDisabled && toggleMotivation(value)}
                aria-pressed={isSelected}
                className={[
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left",
                  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5"
                    : isDisabled
                    ? "border-brand-border opacity-40 cursor-not-allowed"
                    : "border-brand-border hover:border-brand-primary/40 hover:bg-brand-primary/[0.03]",
                ].join(" ")}
              >
                <span className="text-base w-6 text-center flex-shrink-0" aria-hidden="true">
                  {emoji}
                </span>
                <span className="text-sm font-medium text-brand-text flex-1">{label}</span>
                {isSelected && (
                  <span className="ml-auto flex-shrink-0" aria-hidden="true">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => canProceed && onComplete({ timeframe: timeframe!, motivations })}
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
