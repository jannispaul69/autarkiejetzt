"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Local schema uses z.boolean().refine for checkboxes (RHF-friendly)
const contactSchema = z.object({
  first_name: z.string().min(1, "Vorname ist erforderlich"),
  last_name: z.string().min(1, "Nachname ist erforderlich"),
  phone: z
    .string()
    .min(6, "Telefonnummer ist erforderlich")
    .regex(
      /^[\+\d][\d\s\-\(\)]{5,25}$/,
      "Bitte eine gültige Telefonnummer eingeben"
    ),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
  consent_owner_adult: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
  consent_data_sharing: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
  consent_privacy: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
});

export type ContactData = z.infer<typeof contactSchema>;

interface Props {
  onFinalSubmit: (data: ContactData) => Promise<void>;
  onBack: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-brand-error mt-1" role="alert">
      {message}
    </p>
  );
}

export default function Step6Contact({ onFinalSubmit, onBack }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",
    defaultValues: {
      consent_owner_adult: false,
      consent_data_sharing: false,
      consent_privacy: false,
    },
  });

  async function onSubmit(data: ContactData) {
    try {
      await onFinalSubmit(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
      toast.error(message);
    }
  }

  const inputClass = (hasError: boolean) =>
    [
      "h-12 rounded-xl border-brand-border text-brand-text placeholder:text-brand-text-muted/60",
      "focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors",
      hasError ? "border-brand-error focus:ring-brand-error/30" : "",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <p className="font-medium text-brand-text text-[0.9375rem]">
        Fast geschafft! Wo darf dein Berater dich erreichen?
      </p>

      {/* Name fields – side by side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name" className="text-sm font-medium text-brand-text mb-1.5 block">
            Vorname <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="first_name"
            {...register("first_name")}
            placeholder="Max"
            autoComplete="given-name"
            className={inputClass(!!errors.first_name)}
          />
          <FieldError message={errors.first_name?.message} />
        </div>
        <div>
          <Label htmlFor="last_name" className="text-sm font-medium text-brand-text mb-1.5 block">
            Nachname <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="last_name"
            {...register("last_name")}
            placeholder="Mustermann"
            autoComplete="family-name"
            className={inputClass(!!errors.last_name)}
          />
          <FieldError message={errors.last_name?.message} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-brand-text mb-1.5 block">
            Telefon <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            type="tel"
            placeholder="z.B. 0151 23456789"
            autoComplete="tel"
            inputMode="tel"
            className={inputClass(!!errors.phone)}
          />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-brand-text mb-1.5 block">
            E-Mail <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="max@beispiel.de"
            autoComplete="email"
            inputMode="email"
            className={inputClass(!!errors.email)}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      {/* Checkboxen */}
      <div className="flex flex-col gap-3 pt-1">
        {[
          {
            name: "consent_owner_adult" as const,
            label: "Ich bestätige, dass ich Eigentümer der Immobilie und mindestens 18 Jahre alt bin.",
          },
          {
            name: "consent_data_sharing" as const,
            label:
              "Ich willige ein, dass meine Angaben an einen passenden Solar-Installateur aus meiner Region zur Kontaktaufnahme weitergegeben werden. Diese Einwilligung kann ich jederzeit widerrufen.",
          },
          {
            name: "consent_privacy" as const,
            label: null, // rendered manually (contains link)
          },
        ].map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={name}
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-0.5 flex-shrink-0 border-brand-border data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                  />
                  <label
                    htmlFor={name}
                    className="text-sm text-brand-text-muted leading-relaxed cursor-pointer"
                  >
                    {name === "consent_privacy" ? (
                      <>
                        Ich habe die{" "}
                        <a
                          href="/datenschutz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary underline underline-offset-2 hover:text-brand-primary-hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Datenschutzerklärung
                        </a>{" "}
                        gelesen und akzeptiere sie.
                      </>
                    ) : (
                      label
                    )}
                  </label>
                </div>
                {errors[name] && (
                  <p id={`${name}-error`} className="text-xs text-brand-error pl-7" role="alert">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            )}
          />
        ))}
      </div>

      {/* Honeypot – versteckt für Bots */}
      <input type="text" {...register("website" as keyof ContactData)} className="hidden" tabIndex={-1} aria-hidden="true" />

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={[
          "w-full py-4 px-6 rounded-xl font-medium text-base transition-all duration-200 mt-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          isSubmitting
            ? "bg-brand-primary/70 text-white cursor-wait"
            : "bg-brand-primary text-white hover:bg-brand-primary-hover active:scale-[0.99] cursor-pointer",
        ].join(" ")}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Wird gesendet…
          </span>
        ) : (
          "Jetzt kostenlose Beratung anfordern"
        )}
      </button>

      <p className="text-xs text-brand-text-muted text-center leading-relaxed">
        Keine Weitergabe an Dritte. Nur ein Fachbetrieb erhält deine Anfrage.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-brand-text-muted hover:text-brand-text transition-colors text-center focus-visible:outline-none focus-visible:underline"
      >
        ← Zurück
      </button>
    </form>
  );
}
