"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Home, Users, Flame, Building2, HelpCircle } from "lucide-react";

type ConsumptionType = "under_3000" | "3000_5000" | "5000_8000" | "over_8000" | "unknown";

interface Props {
  onComplete: (value: ConsumptionType) => void;
  onBack: () => void;
  defaultValue?: ConsumptionType;
}

type Option = {
  value: ConsumptionType;
  label: string;
  hint: string;
  Icon: LucideIcon;
};

const OPTIONS: Option[] = [
  { value: "under_3000", label: "Unter 3.000 kWh", hint: "Kleiner Haushalt / 1–2 Personen", Icon: Home },
  { value: "3000_5000", label: "3.000 – 5.000 kWh", hint: "Durchschnittlicher Haushalt", Icon: Users },
  { value: "5000_8000", label: "5.000 – 8.000 kWh", hint: "Großer Haushalt / Wärmepumpe", Icon: Flame },
  { value: "over_8000", label: "Über 8.000 kWh", hint: "Sehr hoher Verbrauch / Gewerbe", Icon: Building2 },
  { value: "unknown", label: "Weiß ich nicht", hint: "Steht auf deiner Stromrechnung", Icon: HelpCircle },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function OptionCard({
  option,
  isSelected,
  onClick,
}: {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { Icon, label, hint } = option;
  return (
    <motion.button
      type="button"
      variants={cardVariants}
      onClick={onClick}
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
        <span className="text-xs text-brand-text-muted mt-0.5">{hint}</span>
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
}

export default function Step2Consumption({ onComplete, onBack, defaultValue }: Props) {
  const [selected, setSelected] = useState<ConsumptionType | null>(defaultValue ?? null);

  return (
    <div className="flex flex-col gap-5">
      <p className="font-medium text-brand-text text-[0.9375rem]">
        Wie hoch ist dein ungefährer Jahresstromverbrauch?
      </p>

      <motion.div
        className="grid grid-cols-2 gap-2.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.slice(0, 4).map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            isSelected={selected === option.value}
            onClick={() => setSelected(option.value)}
          />
        ))}
        <div className="col-span-2">
          <OptionCard
            option={OPTIONS[4]}
            isSelected={selected === OPTIONS[4].value}
            onClick={() => setSelected(OPTIONS[4].value)}
          />
        </div>
      </motion.div>

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
