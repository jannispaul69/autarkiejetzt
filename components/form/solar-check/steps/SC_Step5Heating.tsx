"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Flame, Fuel, Thermometer, Wind, Zap, HelpCircle } from "lucide-react";

type HeatingType = "gas" | "oil" | "district" | "heat_pump" | "electric" | "other";

interface Props {
  onComplete: (value: HeatingType) => void;
  onBack: () => void;
  defaultValue?: HeatingType;
}

const OPTIONS: { value: HeatingType; label: string; Icon: LucideIcon }[] = [
  { value: "gas",        label: "Gas",                 Icon: Flame       },
  { value: "oil",        label: "Öl",                  Icon: Fuel        },
  { value: "district",   label: "Fernwärme",           Icon: Thermometer },
  { value: "heat_pump",  label: "Wärmepumpe",          Icon: Wind        },
  { value: "electric",   label: "Strom / Nachtspeicher", Icon: Zap       },
  { value: "other",      label: "Sonstiges",           Icon: HelpCircle  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function SC_Step5Heating({ onComplete, onBack, defaultValue }: Props) {
  const [selected, setSelected] = useState<HeatingType | null>(defaultValue ?? null);

  return (
    <div className="flex flex-col gap-5">
      <p className="font-medium text-brand-text text-[0.9375rem]">
        Womit heizt du aktuell?
      </p>

      <motion.div
        className="grid grid-cols-2 gap-2.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const isSelected = selected === value;
          return (
            <motion.button
              key={value}
              type="button"
              variants={cardVariants}
              onClick={() => setSelected(value)}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isSelected}
              className={[
                "flex items-center gap-3 w-full p-3.5 rounded-xl border-2 text-left",
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
              <span className="font-medium text-brand-text text-sm leading-snug">{label}</span>
              {isSelected && (
                <span className="ml-auto flex-shrink-0" aria-hidden="true">
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

      <p className="text-xs text-brand-text-muted -mt-1">
        Für eine mögliche Kombination mit einer Wärmepumpe relevant
      </p>

      <button
        type="button"
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={[
          "w-full py-3.5 px-6 rounded-xl font-medium text-base transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          selected
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
