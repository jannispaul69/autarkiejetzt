"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import FormProgress from "./FormProgress";
import Step1Housing from "./steps/Step1Housing";
import Step2Consumption from "./steps/Step2Consumption";
import Step3Roof from "./steps/Step3Roof";
import Step4Timeframe from "./steps/Step4Timeframe";
import Step5Location from "./steps/Step5Location";
import Step6Contact, { type ContactData } from "./steps/Step6Contact";

type ConsumptionType = "under_3000" | "3000_5000" | "5000_8000" | "over_8000" | "unknown";
type RoofOrientation = "south" | "east_west" | "north" | "unknown";
type Timeframe = "immediate" | "1_3_months" | "3_6_months" | "info_only";

interface FormState {
  housing_type?: "owner_house" | "owner_apartment";
  annual_consumption?: ConsumptionType;
  roof_orientation?: RoofOrientation;
  timeframe?: Timeframe;
  postal_code?: string;
  city?: string;
}

interface PersistedState {
  currentStep: number;
  formData: FormState;
}

const STORAGE_KEY = "aj_form_state";
const TOTAL_STEPS = 6;

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function MultiStepForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormState>({});
  // Prevents the save effect from overwriting localStorage before restore completes
  const didRestore = useRef(false);

  // Restore saved state on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        if (typeof saved.currentStep === "number" && saved.currentStep >= 1 && saved.currentStep <= 6) {
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

  // Persist on every step or formData change (only after restore)
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // Called by Step1Housing when user clicks "Mieter"
  function handleDisqualified() {
    clearStorage();
  }

  async function handleFinalSubmit(contactData: ContactData) {
    const payload = { ...formData, ...contactData };
    if (process.env.NODE_ENV === "development") {
      console.log("[MultiStepForm] Payload before API call:", payload);
    }

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(body?.error ?? "Übermittlung fehlgeschlagen. Bitte versuche es erneut.");
    }

    clearStorage();

    // Store phone in sessionStorage as fallback (URL param is primary)
    try {
      sessionStorage.setItem("aj_pending_phone", payload.phone ?? "");
    } catch {}

    router.push(
      `/danke/verifizieren?id=${body.leadId}&phone=${encodeURIComponent(payload.phone ?? "")}`,
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-brand-border overflow-hidden">
      {/* Card Header */}
      <div className="px-6 pt-6 pb-5 border-b border-brand-border">
        <h2 className="font-heading text-[1.0625rem] font-semibold text-brand-text leading-snug">
          Deine kostenlose Solar-Beratung
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Schritt {currentStep} von {TOTAL_STEPS} – dauert 60 Sekunden
        </p>
        <div className="mt-4">
          <FormProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      {/* Step Content */}
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
            {currentStep === 1 && (
              <Step1Housing
                onComplete={(housingType) => {
                  if (housingType === "tenant") return;
                  setFormData((prev) => ({ ...prev, housing_type: housingType }));
                  advance();
                }}
                onDisqualified={handleDisqualified}
              />
            )}
            {currentStep === 2 && (
              <Step2Consumption
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, annual_consumption: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.annual_consumption}
              />
            )}
            {currentStep === 3 && (
              <Step3Roof
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, roof_orientation: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.roof_orientation}
              />
            )}
            {currentStep === 4 && (
              <Step4Timeframe
                onComplete={(value) => {
                  setFormData((prev) => ({ ...prev, timeframe: value }));
                  advance();
                }}
                onBack={retreat}
                defaultValue={formData.timeframe}
              />
            )}
            {currentStep === 5 && (
              <Step5Location
                onComplete={(data) => {
                  setFormData((prev) => ({ ...prev, ...data }));
                  advance();
                }}
                onBack={retreat}
                defaultValues={
                  formData.postal_code
                    ? { postal_code: formData.postal_code, city: formData.city }
                    : undefined
                }
              />
            )}
            {currentStep === 6 && (
              <Step6Contact onFinalSubmit={handleFinalSubmit} onBack={retreat} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
