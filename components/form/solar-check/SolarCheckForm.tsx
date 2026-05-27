"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import FormProgress from "@/components/form/FormProgress";
import Step1Housing from "@/components/form/steps/Step1Housing";
import Step2Consumption from "@/components/form/steps/Step2Consumption";
import Step3Roof from "@/components/form/steps/Step3Roof";
import SC_Step2Building from "./steps/SC_Step2Building";
import SC_Step5Heating from "./steps/SC_Step5Heating";
import SC_Step6Finance from "./steps/SC_Step6Finance";
import SC_Step7TimeframeMotivation from "./steps/SC_Step7TimeframeMotivation";
import SC_Step8LocationContact, { type SC8Data } from "./steps/SC_Step8LocationContact";

type HousingType      = "owner_house" | "owner_apartment";
type BuildingType     = "single_family" | "semi_detached" | "multi_family" | "commercial";
type RoofType         = "gable" | "flat" | "pent" | "hip" | "unknown";
type ConsumptionType  = "under_3000" | "3000_5000" | "5000_8000" | "over_8000" | "unknown";
type RoofOrientation  = "south" | "east_west" | "north" | "unknown";
type HeatingType      = "gas" | "oil" | "district" | "heat_pump" | "electric" | "other";
type FinancingType    = "cash" | "financing" | "leasing" | "unknown";
type PreviousConsultation = "none" | "want_second" | "had_offer";
type Timeframe        = "immediate" | "1_3_months" | "3_6_months" | "info_only";
type Motivation       = "cost" | "independence" | "environment" | "property_value" | "storage";

interface SCFormState {
  housing_type?:          HousingType;
  building_type?:         BuildingType;
  roof_type?:             RoofType;
  annual_consumption?:    ConsumptionType;
  roof_orientation?:      RoofOrientation;
  heating_type?:          HeatingType;
  financing_type?:        FinancingType;
  previous_consultation?: PreviousConsultation;
  timeframe?:             Timeframe;
  motivations?:           Motivation[];
}

interface PersistedState {
  currentStep: number;
  formData: SCFormState;
}

const STORAGE_KEY  = "aj_sc_form_state";
const TOTAL_STEPS  = 8;

const slideVariants: Variants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -40 :  40, opacity: 0 }),
};

export default function SolarCheckForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction,   setDirection]   = useState(1);
  const [formData,    setFormData]    = useState<SCFormState>({});
  const didRestore = useRef(false);

  // Restore saved state on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        if (typeof saved.currentStep === "number" && saved.currentStep >= 1 && saved.currentStep <= TOTAL_STEPS) {
          setCurrentStep(saved.currentStep);
        }
        if (saved.formData && typeof saved.formData === "object") {
          setFormData(saved.formData);
        }
      }
    } catch {
      // localStorage unavailable or corrupted — start fresh
    }
    didRestore.current = true;
  }, []);

  // Persist on every change (only after restore)
  useEffect(() => {
    if (!didRestore.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, formData }));
    } catch {}
  }, [currentStep, formData]);

  function advance() {
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }

  function retreat() {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }

  function clearStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  async function handleFinalSubmit(finalData: SC8Data) {
    const payload = {
      ...formData,
      ...finalData,
      landing_page: "solar-check",
    };

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error ?? "Übermittlung fehlgeschlagen. Bitte versuche es erneut.");
    }

    clearStorage();
    router.push("/danke");
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-brand-border overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-brand-border">
        <h2 className="font-heading text-[1.0625rem] font-semibold text-brand-text leading-snug">
          Dein Solar-Check
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Schritt {currentStep} von {TOTAL_STEPS} – dauert ca. 3 Minuten
        </p>
        <div className="mt-4">
          <FormProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {/* Step 1: Wohnsituation (shared) */}
            {currentStep === 1 && (
              <Step1Housing
                onComplete={(housingType) => {
                  if (housingType === "tenant") return;
                  setFormData((prev) => ({ ...prev, housing_type: housingType }));
                  advance();
                }}
                onDisqualified={clearStorage}
              />
            )}

            {/* Step 2: Gebäude + Dachform (new) */}
            {currentStep === 2 && (
              <SC_Step2Building
                onComplete={(data) => {
                  setFormData((prev) => ({ ...prev, ...data }));
                  advance();
                }}
                onBack={retreat}
                defaultValues={{
                  building_type: formData.building_type,
                  roof_type:     formData.roof_type,
                }}
              />
            )}

            {/* Step 3: Stromverbrauch (shared) */}
            {currentStep === 3 && (
              <Step2Consumption
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, annual_consumption: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.annual_consumption}
              />
            )}

            {/* Step 4: Dachausrichtung (shared) */}
            {currentStep === 4 && (
              <Step3Roof
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, roof_orientation: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.roof_orientation}
              />
            )}

            {/* Step 5: Heizung (new) */}
            {currentStep === 5 && (
              <SC_Step5Heating
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, heating_type: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.heating_type}
              />
            )}

            {/* Step 6: Finanzierung + Vorige Beratung (new) */}
            {currentStep === 6 && (
              <SC_Step6Finance
                onComplete={(data) => {
                  setFormData((prev) => ({ ...prev, ...data }));
                  advance();
                }}
                onBack={retreat}
                defaultValues={{
                  financing_type:        formData.financing_type,
                  previous_consultation: formData.previous_consultation,
                }}
              />
            )}

            {/* Step 7: Zeitraum + Motivation (new) */}
            {currentStep === 7 && (
              <SC_Step7TimeframeMotivation
                onComplete={(data) => {
                  setFormData((prev) => ({ ...prev, ...data }));
                  advance();
                }}
                onBack={retreat}
                defaultValues={{
                  timeframe:   formData.timeframe,
                  motivations: formData.motivations,
                }}
              />
            )}

            {/* Step 8: PLZ + Kontakt (combined final step) */}
            {currentStep === 8 && (
              <SC_Step8LocationContact
                onFinalSubmit={handleFinalSubmit}
                onBack={retreat}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
