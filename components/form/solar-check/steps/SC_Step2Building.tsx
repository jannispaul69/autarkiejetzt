"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Home, Building2, Building, Users, HelpCircle, TrendingUp, Layers, Square } from "lucide-react";

type BuildingType = "single_family" | "semi_detached" | "multi_family" | "commercial";
type RoofType = "gable" | "flat" | "pent" | "hip" | "unknown";

interface Props {
  onComplete: (data: { building_type: BuildingType; roof_type: RoofType }) => void;
  onBack: () => void;
  defaultValues?: { building_type?: BuildingType; roof_type?: RoofType };
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const BUILDING_OPTIONS: { value: BuildingType; label: string; Icon: LucideIcon }[] = [
  { value: "single_family",  label: "Einfamilienhaus",             Icon: Home      },
  { value: "semi_detached",  label: "Doppelhaus / Reihenhaus",     Icon: Users     },
  { value: "multi_family",   label: "Mehrfamilienhaus",            Icon: Building2 },
  { value: "commercial",     label: "Gewerbegebäude",              Icon: Building  },
];

const ROOF_OPTIONS: { value: RoofType; label: string; badge?: string; Icon: LucideIcon }[] = [
  { value: "gable",   label: "Satteldach",   badge: "beliebt", Icon: Home        },
  { value: "flat",    label: "Flachdach",                      Icon: Square      },
  { value: "pent",    label: "Pultdach",                       Icon: TrendingUp  },
  { value: "hip",     label: "Walmdach",                       Icon: Layers      },
  { value: "unknown", label: "Weiß ich nicht",                 Icon: HelpCircle  },
];

function OptionCard({
  label, badge, Icon, isSelected, onClick,
}: {
  label: string;
  badge?: string;
  Icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={cardVariants}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      aria-pressed={isSelected}
      className={[
        "flex items-start gap-3 w-full p-3 rounded-xl border-2 text-left",
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
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-medium text-brand-text text-sm leading-snug">{label}</span>
        {badge && (
          <span className="mt-1 inline-flex self-start px-1.5 py-0.5 rounded text-xs font-medium bg-brand-accent/20 text-brand-text">
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

export default function SC_Step2Building({ onComplete, onBack, defaultValues }: Props) {
  const [buildingType, setBuildingType] = useState<BuildingType | null>(defaultValues?.building_type ?? null);
  const [roofType, setRoofType] = useState<RoofType | null>(defaultValues?.roof_type ?? null);

  const canProceed = buildingType !== null && roofType !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Q1: Gebäudeart */}
      <div className="flex flex-col gap-3">
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Was für ein Gebäude ist es?
        </p>
        <motion.div
          className="grid grid-cols-2 gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {BUILDING_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              Icon={opt.Icon}
              isSelected={buildingType === opt.value}
              onClick={() => setBuildingType(opt.value)}
            />
          ))}
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      {/* Q2: Dachform */}
      <div className="flex flex-col gap-3">
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Welche Dachform hat dein Gebäude?
        </p>
        <motion.div
          className="grid grid-cols-2 gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {ROOF_OPTIONS.slice(0, 4).map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              badge={opt.badge}
              Icon={opt.Icon}
              isSelected={roofType === opt.value}
              onClick={() => setRoofType(opt.value)}
            />
          ))}
          <div className="col-span-2">
            <OptionCard
              label={ROOF_OPTIONS[4].label}
              Icon={ROOF_OPTIONS[4].Icon}
              isSelected={roofType === "unknown"}
              onClick={() => setRoofType("unknown")}
            />
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => canProceed && onComplete({ building_type: buildingType!, roof_type: roofType! })}
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
