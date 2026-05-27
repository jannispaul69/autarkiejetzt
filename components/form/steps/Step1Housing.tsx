"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Home, Building2, Key } from "lucide-react";
import DisqualifiedScreen from "../DisqualifiedScreen";

type HousingType = "owner_house" | "owner_apartment" | "tenant";

interface Props {
  onComplete: (housingType: HousingType) => void;
  onDisqualified?: () => void;
}

type Option = {
  value: HousingType;
  label: string;
  Icon: LucideIcon;
};

const OPTIONS: Option[] = [
  { value: "owner_house", label: "Eigentümer eines Hauses", Icon: Home },
  { value: "owner_apartment", label: "Eigentümer einer Eigentumswohnung", Icon: Building2 },
  { value: "tenant", label: "Mieter", Icon: Key },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function Step1Housing({ onComplete, onDisqualified }: Props) {
  const [selected, setSelected] = useState<HousingType | null>(null);
  const [isDisqualified, setIsDisqualified] = useState(false);

  function handleCardClick(value: HousingType) {
    if (value === "tenant") {
      setIsDisqualified(true);
      onDisqualified?.();
      return;
    }
    setSelected(value);
  }

  if (isDisqualified) {
    return <DisqualifiedScreen onBack={() => setIsDisqualified(false)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-medium text-brand-text text-[0.9375rem]">
        Welche Wohnsituation trifft auf dich zu?
      </p>

      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const isSelected = selected === value;
          const isTenant = value === "tenant";

          return (
            <motion.button
              key={value}
              type="button"
              variants={cardVariants}
              onClick={() => handleCardClick(value)}
              whileTap={{ scale: 0.985 }}
              aria-pressed={isSelected}
              className={[
                "flex items-center gap-4 w-full px-4 py-4 rounded-xl border-2 text-left",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                isSelected
                  ? "border-brand-primary bg-brand-primary/5"
                  : isTenant
                  ? "border-brand-border opacity-70 hover:opacity-90 hover:border-brand-border"
                  : "border-brand-border hover:border-brand-primary/40 hover:bg-brand-primary/[0.03]",
              ].join(" ")}
            >
              {/* Icon box */}
              <span
                className={[
                  "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-colors duration-200",
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-[#F4F4F2] text-brand-text-muted",
                ].join(" ")}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </span>

              {/* Label */}
              <span
                className={[
                  "font-medium text-[0.9375rem] flex-1",
                  isSelected ? "text-brand-text" : "text-brand-text",
                  isTenant ? "text-brand-text-muted" : "",
                ].join(" ")}
              >
                {label}
              </span>

              {/* Check indicator */}
              {isSelected && (
                <span className="ml-auto flex-shrink-0" aria-hidden="true">
                  <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                    <path
                      d="M8 12l2.5 2.5L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <button
        type="button"
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={[
          "w-full py-3.5 px-6 rounded-xl font-medium text-base mt-1",
          "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          selected
            ? "bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.99] cursor-pointer"
            : "bg-brand-border text-brand-text-muted cursor-not-allowed",
        ].join(" ")}
      >
        Weiter →
      </button>
    </div>
  );
}
