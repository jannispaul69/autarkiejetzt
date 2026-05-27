"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const sc8Schema = z.object({
  postal_code: z
    .string()
    .regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben"),
  city: z.string().optional(),
  first_name: z.string().min(1, "Vorname ist erforderlich"),
  last_name: z.string().min(1, "Nachname ist erforderlich"),
  phone: z
    .string()
    .min(6, "Telefonnummer ist erforderlich")
    .regex(/^[\+\d][\d\s\-\(\)]{5,25}$/, "Bitte eine gültige Telefonnummer eingeben"),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
  consent_owner_adult: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
  consent_data_sharing: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
  consent_privacy: z.boolean().refine((v) => v, { message: "Zustimmung erforderlich" }),
});

export type SC8Data = z.infer<typeof sc8Schema>;

interface Props {
  onFinalSubmit: (data: SC8Data) => Promise<void>;
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

export default function SC_Step8LocationContact({ onFinalSubmit, onBack }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SC8Data>({
    resolver: zodResolver(sc8Schema),
    mode: "onSubmit",
    defaultValues: {
      consent_owner_adult: false,
      consent_data_sharing: false,
      consent_privacy: false,
    },
  });

  async function onSubmit(data: SC8Data) {
    try {
      await onFinalSubmit(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
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
      {/* Location section */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" strokeWidth={2} aria-hidden="true" />
        <p className="font-medium text-brand-text text-[0.9375rem]">
          Wo befindet sich dein Objekt?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 -mt-2">
        <div>
          <Label htmlFor="sc8-postal" className="text-sm font-medium text-brand-text mb-1.5 block">
            PLZ <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="sc8-postal"
            {...register("postal_code")}
            placeholder="28195"
            maxLength={5}
            inputMode="numeric"
            autoComplete="postal-code"
            className={inputClass(!!errors.postal_code)}
          />
          <FieldError message={errors.postal_code?.message} />
        </div>
        <div>
          <Label htmlFor="sc8-city" className="text-sm font-medium text-brand-text mb-1.5 block">
            Ort <span className="text-brand-text-muted text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="sc8-city"
            {...register("city")}
            placeholder="Bremen"
            autoComplete="address-level2"
            className={inputClass(false)}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-border" />

      {/* Contact section */}
      <p className="font-medium text-brand-text text-[0.9375rem] -mb-1">
        Fast geschafft! Wie können wir dich erreichen?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sc8-first" className="text-sm font-medium text-brand-text mb-1.5 block">
            Vorname <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="sc8-first"
            {...register("first_name")}
            placeholder="Max"
            autoComplete="given-name"
            className={inputClass(!!errors.first_name)}
          />
          <FieldError message={errors.first_name?.message} />
        </div>
        <div>
          <Label htmlFor="sc8-last" className="text-sm font-medium text-brand-text mb-1.5 block">
            Nachname <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="sc8-last"
            {...register("last_name")}
            placeholder="Mustermann"
            autoComplete="family-name"
            className={inputClass(!!errors.last_name)}
          />
          <FieldError message={errors.last_name?.message} />
        </div>
        <div>
          <Label htmlFor="sc8-phone" className="text-sm font-medium text-brand-text mb-1.5 block">
            Telefon <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="sc8-phone"
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
          <Label htmlFor="sc8-email" className="text-sm font-medium text-brand-text mb-1.5 block">
            E-Mail <span className="text-brand-error" aria-hidden="true">*</span>
          </Label>
          <Input
            id="sc8-email"
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

      {/* Consents */}
      <div className="flex flex-col gap-3 pt-1">
        {(["consent_owner_adult", "consent_data_sharing", "consent_privacy"] as const).map((name) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`sc8-${name}`}
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    className="mt-0.5 flex-shrink-0 border-brand-border data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <label
                    htmlFor={`sc8-${name}`}
                    className="text-sm text-brand-text-muted leading-relaxed cursor-pointer"
                  >
                    {name === "consent_owner_adult" &&
                      "Ich bestätige, dass ich Eigentümer der Immobilie und mindestens 18 Jahre alt bin."}
                    {name === "consent_data_sharing" &&
                      "Ich willige gemäß Art. 6 Abs. 1 lit. a DSGVO ein, dass meine Angaben zur Vermittlung einer Photovoltaik-Beratung an einen einzigen regionalen Fachbetrieb weitergegeben werden. Diese Einwilligung kann ich jederzeit per E-Mail an anfrage@autarkiejetzt.de widerrufen."}
                    {name === "consent_privacy" && (
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
                    )}
                  </label>
                </div>
                {errors[name] && (
                  <p className="text-xs text-brand-error pl-7" role="alert">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            )}
          />
        ))}
      </div>

      {/* Honeypot – hidden from real users */}
      <input
        type="text"
        {...register("website" as keyof SC8Data)}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

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
          "Jetzt Solar-Check anfordern"
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
