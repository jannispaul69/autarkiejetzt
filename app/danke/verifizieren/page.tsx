"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck, Clock } from "lucide-react";

// ─── Countdown helpers ────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadId = searchParams.get("id") ?? "";

  // Phone display from sessionStorage
  const [maskedPhone, setMaskedPhone] = useState<string>("deiner Nummer");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("aj_pending_phone");
      if (raw) {
        const digits = raw.replace(/\D/g, "");
        if (digits.length >= 4) {
          const last2 = digits.slice(-2);
          setMaskedPhone(`+49 *** *** **${last2}`);
        }
      }
    } catch {}
  }, []);

  // OTP state
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null]);

  // Submission state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"input" | "success">("input");

  // Countdown: 600s initial, resend available after 60s cooldown
  const [countdown, setCountdown] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // Resend cooldown — intentionally runs once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(resendTimerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(resendTimerRef.current!);
  }, []);

  // ── Verify ──────────────────────────────────────────────────────────────────
  const submitCode = useCallback(
    async (code: string) => {
      if (!leadId || code.length !== 4 || isVerifying) return;
      setIsVerifying(true);
      setError(null);

      try {
        const res = await fetch("/api/verify/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_id: leadId, code }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (data.error === "expired") {
            setError("Der Code ist abgelaufen. Bitte fordere einen neuen Code an.");
          } else if (data.error === "max_attempts") {
            setError(
              "Zu viele Fehlversuche. Bitte kontaktiere uns: support@autarkiejetzt.de",
            );
          } else if (data.error === "invalid_code") {
            const left = data.attempts_left ?? null;
            if (left === 0) {
              setError(
                "Zu viele Fehlversuche. Bitte kontaktiere uns: support@autarkiejetzt.de",
              );
            } else {
              setError(
                `Falscher Code. Noch ${left} ${left === 1 ? "Versuch" : "Versuche"} übrig.`,
              );
            }
            // Reset inputs
            setDigits(["", "", "", ""]);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
          } else {
            setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
          }
        } else {
          setPhase("success");
          clearInterval(timerRef.current!);
          // Redirect to thank-you page after short delay
          setTimeout(() => {
            try { sessionStorage.removeItem("aj_pending_phone"); } catch {}
            router.push("/danke");
          }, 2500);
        }
      } catch {
        setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung.");
      } finally {
        setIsVerifying(false);
      }
    },
    [leadId, isVerifying, router],
  );

  // ── Handle digit input ───────────────────────────────────────────────────────
  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (char && index === 3) {
      const code = newDigits.join("");
      if (code.length === 4) submitCode(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newDigits = ["", "", "", ""].map((_, i) => pasted[i] ?? "");
    setDigits(newDigits);
    setError(null);
    const lastFilled = Math.min(pasted.length - 1, 3);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 4) submitCode(pasted);
  }

  // ── Resend ───────────────────────────────────────────────────────────────────
  async function handleResend() {
    if (isResending || resendCooldown > 0 || !leadId) return;
    setIsResending(true);
    setError(null);

    try {
      const rawPhone = (() => {
        try { return sessionStorage.getItem("aj_pending_phone") ?? ""; } catch { return ""; }
      })();

      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, phone: rawPhone }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === "rate_limit") {
          setError("Bitte warte etwas, bevor du einen neuen Code anforderst.");
        } else {
          setError("Code konnte nicht gesendet werden. Bitte versuche es erneut.");
        }
      } else {
        // Reset countdowns
        setCountdown(600);
        setResendCooldown(60);
        setDigits(["", "", "", ""]);
        // Restart main timer
        clearInterval(timerRef.current!);
        timerRef.current = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) { clearInterval(timerRef.current!); return 0; }
            return c - 1;
          });
        }, 1000);
        // Restart resend cooldown
        clearInterval(resendTimerRef.current!);
        resendTimerRef.current = setInterval(() => {
          setResendCooldown((c) => {
            if (c <= 1) { clearInterval(resendTimerRef.current!); return 0; }
            return c - 1;
          });
        }, 1000);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setIsResending(false);
    }
  }

  // ── Success phase ────────────────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-5">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-brand-text">
            Telefon bestätigt!
          </h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Deine Anfrage ist bei uns angekommen. Wir leiten dich weiter …
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center text-xs text-brand-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> DSGVO-konform
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Geprüfte Fachbetriebe
          </span>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
      </div>
    );
  }

  // ── Input phase ──────────────────────────────────────────────────────────────
  const isExpired = countdown === 0;
  const codeComplete = digits.every((d) => d !== "");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-brand-text">
          Telefonnummer bestätigen
        </h2>
        <p className="text-sm text-brand-text-muted mt-1.5">
          Wir haben einen 4-stelligen Code an{" "}
          <span className="font-medium text-brand-text">{maskedPhone}</span> gesendet.
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
            disabled={isVerifying || isExpired}
            className={[
              "w-14 h-16 text-center text-2xl font-semibold rounded-xl border-2 outline-none transition-all",
              "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
              d ? "border-brand-primary bg-brand-primary/5" : "border-brand-border bg-white",
              isVerifying || isExpired ? "opacity-50 cursor-not-allowed" : "",
              error && !isVerifying ? "border-red-400" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      {/* Verify button (shown when complete but auto-submit handles it — fallback) */}
      {codeComplete && !isVerifying && !isExpired && (
        <button
          onClick={() => submitCode(digits.join(""))}
          className="w-full bg-brand-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-primary-hover transition-colors"
        >
          Code bestätigen
        </button>
      )}

      {/* Loading */}
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-brand-text-muted py-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Wird überprüft …</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Countdown + resend */}
      <div className="flex flex-col items-center gap-2 text-sm">
        {isExpired ? (
          <p className="text-red-600 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Code abgelaufen
          </p>
        ) : (
          <p className="text-brand-text-muted flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Gültig noch{" "}
            <span className="font-medium tabular-nums">{formatTime(countdown)}</span>
          </p>
        )}

        {resendCooldown > 0 && !isExpired ? (
          <p className="text-brand-text-muted text-xs">
            Neuer Code in{" "}
            <span className="tabular-nums font-medium">{resendCooldown}s</span> möglich
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="flex items-center gap-1.5 text-brand-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isResending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {isResending ? "Wird gesendet …" : "Neuen Code senden"}
          </button>
        )}
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-brand-text-muted/70">
        Kein Code erhalten? Prüfe deinen SMS-Eingang oder kontaktiere uns:{" "}
        <a
          href="mailto:support@autarkiejetzt.de"
          className="text-brand-primary hover:underline"
        >
          support@autarkiejetzt.de
        </a>
      </p>
    </div>
  );
}

// ─── Page (Suspense boundary for useSearchParams) ─────────────────────────────

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-brand-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / brand strip */}
        <div className="text-center mb-8">
          <span className="font-heading text-2xl font-extrabold text-brand-primary tracking-tight">
            Autarkie Jetzt
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-brand-border px-6 py-8">
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              </div>
            }
          >
            <VerifyContent />
          </Suspense>
        </div>

        {/* Trust footnote */}
        <p className="text-center text-xs text-brand-text-muted mt-4">
          🔒 Deine Daten sind sicher. DSGVO-konform gespeichert.
        </p>
      </div>
    </main>
  );
}
