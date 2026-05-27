"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { step5Schema } from "@/lib/validation/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step5Data = { postal_code: string; city?: string };

interface Props {
  onComplete: (data: Step5Data) => void;
  onBack: () => void;
  defaultValues?: Step5Data;
}

export default function Step5Location({ onComplete, onBack, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    mode: "onBlur",
    defaultValues: defaultValues ?? { postal_code: "", city: "" },
  });

  const postalCode = watch("postal_code", "");
  const isPostalValid = /^\d{5}$/.test(postalCode);

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" strokeWidth={2} aria-hidden="true" />
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Wo befindet sich dein Objekt?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* PLZ */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postal_code" className="text-sm font-medium text-brand-text">
            Postleitzahl <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="postal_code"
            {...register("postal_code")}
            placeholder="28195"
            maxLength={5}
            inputMode="numeric"
            autoComplete="postal-code"
            className={[
              "h-12 rounded-xl border-brand-border text-brand-text placeholder:text-brand-text-muted/60",
              "focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
              errors.postal_code ? "border-brand-error focus:ring-brand-error/30" : "",
            ].join(" ")}
            aria-describedby={errors.postal_code ? "plz-error" : "plz-hint"}
          />
          {errors.postal_code ? (
            <p id="plz-error" className="text-xs text-brand-error" role="alert">
              {errors.postal_code.message}
            </p>
          ) : (
            <p id="plz-hint" className="text-xs text-brand-text-muted">
              Wir verbinden dich mit Fachbetrieben in deiner Region
            </p>
          )}
        </div>

        {/* Stadt */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city" className="text-sm font-medium text-brand-text">
            Ort <span className="text-brand-text-muted text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="city"
            {...register("city")}
            placeholder="Bremen"
            autoComplete="address-level2"
            className="h-12 rounded-xl border-brand-border text-brand-text placeholder:text-brand-text-muted/60 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit(onComplete)}
        disabled={!isPostalValid}
        className={[
          "w-full py-3.5 px-6 rounded-xl font-medium text-base transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          isPostalValid
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
    </motion.div>
  );
}
