"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Zap, Calendar, CalendarDays, BookOpen } from "lucide-react";

type Timeframe = "immediate" | "1_3_months" | "3_6_months" | "info_only";

interface Props {
  onComplete: (value: Timeframe) => void;
  onBack: () => void;
  defaultValue?: Timeframe;
}

type Option = {
  value: Timeframe;
  label: string;
  badge?: string;
  Icon: LucideIcon;
};

const OPTIONS: Option[] = [
  { value: "immediate", label: "So schnell wie möglich", badge: "🔥 Beliebt", Icon: Zap },
  { value: "1_3_months", label: "In 1–3 Monaten", Icon: Calendar },
  { value: "3_6_months", label: "In 3–6 Monaten", Icon: CalendarDays },
  { value: "info_only", label: "Erstmal nur informieren", Icon: BookOpen },
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
  const { Icon, label, badge } = option;
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
}

export default function Step4Timeframe({ onComplete, onBack, defaultValue }: Props) {
  const [selected, setSelected] = useState<Timeframe | null>(defaultValue ?? null);

  return (
    <div className="flex flex-col gap-5">
      <p className="font-medium text-brand-text text-[0.9375rem]">
        Wann möchtest du deine Solaranlage umsetzen?
      </p>

      <motion.div
        className="grid grid-cols-2 gap-2.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            isSelected={selected === option.value}
            onClick={() => setSelected(option.value)}
          />
        ))}
      </motion.div>

      {/* info_only reassurance badge */}
      {selected === "info_only" && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm leading-relaxed -mt-1">
          <span aria-hidden="true" className="flex-shrink-0 mt-0.5">ℹ️</span>
          <span>
            Kein Problem – du erhältst trotzdem eine kostenlose Ersteinschätzung.
          </span>
        </div>
      )}

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
