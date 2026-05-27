"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function JetztPage() {
  const [postalCode, setPostalCode]   = useState("");
  const [phone, setPhone]             = useState("");
  const [firstName, setFirstName]     = useState("");
  const [consent, setConsent]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!/^\d{5}$/.test(postalCode)) { setError("Bitte eine gültige 5-stellige PLZ eingeben."); return; }
    if (phone.trim().length < 6)      { setError("Bitte deine Telefonnummer eingeben."); return; }
    if (!firstName.trim())            { setError("Bitte deinen Vornamen eingeben."); return; }
    if (!consent)                     { setError("Bitte stimme der Datenweitergabe zu."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing_page:          "jetzt",
          housing_type:          "owner_house",
          annual_consumption:    "unknown",
          roof_orientation:      "unknown",
          timeframe:             "immediate",
          postal_code:           postalCode,
          phone:                 phone.trim(),
          first_name:            firstName.trim(),
          last_name:             "",
          email:                 "",
          consent_owner_adult:   true,
          consent_data_sharing:  true,
          consent_privacy:       true,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-5"
      style={{ backgroundColor: "#FAFAF7" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Logo */}
        <div>
          <Image
            src="/logo-2.png"
            alt="Autarkie Jetzt"
            width={1693}
            height={929}
            className="h-8 w-auto"
            priority
          />
        </div>

        {/* Hero copy */}
        <div className="flex flex-col gap-2">
          <h1
            className="font-heading text-[1.75rem] leading-tight tracking-tight text-brand-text"
            style={{ fontWeight: 800 }}
          >
            Strom vom eigenen Dach.
          </h1>
          <p className="text-[0.9375rem] text-brand-text-muted leading-relaxed">
            Wir sagen dir kostenlos was das kostet –
            ein Experte aus deiner Region meldet sich heute.
          </p>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#F4B400] tracking-wide" aria-hidden="true">★★★★★</span>
          <span className="text-brand-text-muted">Bereits über 500 Anfragen vermittelt</span>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-md border border-brand-border overflow-hidden">
          {success ? (
            /* ── Success state ── */
            <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: "#F0FAF4" }}
                aria-hidden="true"
              >
                ✅
              </div>
              <p className="font-semibold text-brand-text text-[1.0625rem] leading-snug">
                Danke {firstName}!
              </p>
              <p className="text-brand-text-muted text-sm leading-relaxed">
                Ein Experte meldet sich heute noch bei dir.
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} noValidate className="px-5 py-5 flex flex-col gap-3">
              {/* PLZ */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                autoFocus
                placeholder="Deine Postleitzahl"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                required
                disabled={loading}
                className="h-12 w-full rounded-xl border border-brand-border bg-white px-4 text-brand-text placeholder:text-brand-text-muted/60 text-[0.9375rem] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />

              {/* Phone */}
              <input
                type="tel"
                inputMode="tel"
                placeholder="Deine Telefonnummer"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
                className="h-12 w-full rounded-xl border border-brand-border bg-white px-4 text-brand-text placeholder:text-brand-text-muted/60 text-[0.9375rem] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />

              {/* First name */}
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Dein Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="h-12 w-full rounded-xl border border-brand-border bg-white px-4 text-brand-text placeholder:text-brand-text-muted/60 text-[0.9375rem] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />

              {/* Error */}
              {error && (
                <p className="text-xs text-red-600 -mt-1" role="alert">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl font-medium text-base text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                style={{
                  backgroundColor: loading ? "rgba(10,77,60,0.7)" : "#0A4D3C",
                }}
              >
                {loading ? "Wird gesendet…" : "Jetzt kostenlos anfragen →"}
              </button>

              {/* Trust line */}
              <p className="text-center text-xs text-brand-text-muted leading-relaxed">
                ✓ Kostenlos &nbsp;·&nbsp; ✓ Kein Spam &nbsp;·&nbsp; ✓ 1 Anruf vom Experten
              </p>

              {/* Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-brand-border accent-brand-primary cursor-pointer"
                />
                <span className="text-[0.6875rem] text-brand-text-muted leading-relaxed">
                  Ich willige in die Weitergabe meiner Daten an einen Solar-Experten ein.{" "}
                  <Link
                    href="/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-brand-text"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Datenschutz
                  </Link>
                </span>
              </label>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-brand-text-muted pb-2">
          <Link href="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
        </p>
      </div>
    </main>
  );
}
