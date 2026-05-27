"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; firstName: string | null }
  | { status: "error"; message: string };

export default function DeletionRequestForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  function validateEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!agreed) return;

    setState({ status: "loading" });

    try {
      const res = await fetch("/api/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        first_name?: string | null;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setState({
          status: "error",
          message:
            data.error ??
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.",
        });
        return;
      }

      setState({
        status: "success",
        message: data.message ?? "Anfrage erfolgreich verarbeitet.",
        firstName: data.first_name ?? (firstName.trim() || null),
      });
    } catch {
      setState({
        status: "error",
        message:
          "Anfrage konnte nicht gesendet werden. Bitte prüfe deine Internetverbindung.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{
          backgroundColor: "#F0FAF4",
          borderColor: "rgba(10, 77, 60, 0.20)",
          borderLeftWidth: "4px",
          borderLeftColor: "#0A4D3C",
        }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 flex-shrink-0"
            style={{ color: "#0A4D3C" }}
            size={22}
            aria-hidden="true"
          />
          <div>
            <h3 className="font-heading font-bold text-brand-text mb-1">
              {state.firstName ? `${state.firstName}, d` : "D"}eine Anfrage wurde bearbeitet
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              {state.message}
            </p>
            <p className="mt-3 text-xs text-brand-text-muted">
              Keine E-Mail erhalten? Schreib uns an{" "}
              <a
                href="mailto:anfrage@autarkiejetzt.de"
                className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
              >
                anfrage@autarkiejetzt.de
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-6 sm:p-8"
      style={{
        backgroundColor: "#F0FAF4",
        borderColor: "rgba(10, 77, 60, 0.20)",
        borderLeftWidth: "4px",
        borderLeftColor: "#0A4D3C",
      }}
    >
      <h2 className="font-heading text-xl font-bold text-brand-text mb-2 tracking-tight">
        Datenlöschung beantragen
      </h2>
      <p className="text-brand-text-muted leading-[1.8] mb-6 text-sm">
        Gib deine E-Mail-Adresse ein. Wir löschen alle zugehörigen Datensätze
        und senden dir eine Bestätigung gemäß Art. 17 DSGVO innerhalb weniger
        Minuten.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deletion-email"
            className="text-sm font-medium text-brand-text"
          >
            E-Mail-Adresse{" "}
            <span className="text-brand-error" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="deletion-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="deine@email.de"
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-text-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0"
            style={{
              borderColor: emailError ? "#DC2626" : "#E8E5DE",
            }}
            aria-describedby={emailError ? "deletion-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            disabled={state.status === "loading"}
          />
          {emailError && (
            <p
              id="deletion-email-error"
              className="text-xs text-brand-error"
              role="alert"
            >
              {emailError}
            </p>
          )}
        </div>

        {/* Optional first name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deletion-firstname"
            className="text-sm font-medium text-brand-text"
          >
            Vorname{" "}
            <span className="text-xs font-normal text-brand-text-muted">
              (optional)
            </span>
          </label>
          <input
            id="deletion-firstname"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="z. B. Max"
            className="w-full rounded-lg border border-brand-border px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-text-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0"
            disabled={state.status === "loading"}
          />
        </div>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <span className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer sr-only"
              required
              disabled={state.status === "loading"}
            />
            <span
              className="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-1"
              style={{
                backgroundColor: agreed ? "#0A4D3C" : "#fff",
                borderColor: agreed ? "#0A4D3C" : "#E8E5DE",
              }}
              aria-hidden="true"
            >
              {agreed && (
                <svg
                  viewBox="0 0 12 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-2.5"
                >
                  <polyline points="1 5 4.5 8.5 11 1" />
                </svg>
              )}
            </span>
          </span>
          <span className="text-xs text-brand-text-muted leading-relaxed">
            Ich bestätige, dass ich der Inhaber der angegebenen E-Mail-Adresse
            bin und beantrage die unwiderrufliche Löschung meiner Daten gemäß
            Art. 17 DSGVO.
          </span>
        </label>

        {/* Error message */}
        {state.status === "error" && (
          <p className="text-sm text-brand-error" role="alert">
            {state.message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state.status === "loading" || !agreed || !email}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0A4D3C" }}
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Wird verarbeitet…
            </>
          ) : (
            "Datenlöschung beantragen"
          )}
        </button>

        <p className="text-xs text-brand-text-muted">
          Antwort innerhalb weniger Minuten · Bestätigung per E-Mail ·
          Gemäß Art. 17 DSGVO
        </p>
      </form>
    </div>
  );
}
