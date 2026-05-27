"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Smartphone,
  Phone,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Clock,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Client-side duplicate of lib/twilio/verify.ts isMobileNumber — safe to use in browser */
function isMobileNumber(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+\(\)\/]/g, "");
  return (
    /^(49)?(015|016|017)\d/.test(clean) ||
    /^(0)(15|16|17)\d/.test(clean)
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last2 = digits.slice(-2);
  return `+49 *** *** **${last2}`;
}

// ─── Inner component ─────────────────────────────────────────────────────────

type Phase = "choosing_channel" | "waiting_for_code" | "success";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const leadId   = searchParams.get("id") ?? "";
  const rawPhone = (() => {
    const p = searchParams.get("phone");
    if (p) return p;
    // Fallback to sessionStorage
    try { return sessionStorage.getItem("aj_pending_phone") ?? ""; } catch { return ""; }
  })();

  const isMobile = isMobileNumber(rawPhone);

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase,    setPhase]   = useState<Phase>("choosing_channel");
  const [channel,  setChannel] = useState<"sms" | "call">(isMobile ? "sms" : "call");
  const [code,     setCode]    = useState("");
  const [isSending,     setIsSending]     = useState(false);
  const [isVerifying,   setIsVerifying]   = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // Countdown (600s) — starts when entering waiting_for_code
  const [countdown,       setCountdown]       = useState(600);
  const [showChannelLink, setShowChannelLink] = useState(false);
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelLinkRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Start timers when phase flips to waiting_for_code
  useEffect(() => {
    if (phase !== "waiting_for_code") return;

    setCountdown(600);
    setShowChannelLink(false);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);

    channelLinkRef.current = setTimeout(() => setShowChannelLink(true), 60_000);

    setTimeout(() => inputRef.current?.focus(), 80);

    return () => {
      clearInterval(countdownRef.current!);
      clearTimeout(channelLinkRef.current!);
    };
  }, [phase]);

  // ── Send code ───────────────────────────────────────────────────────────────
  async function handleSend(ch: "sms" | "call") {
    if (!leadId || isSending) return;
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, phone: rawPhone, channel: ch }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === "rate_limit") {
          setError(
            "Zu viele Anfragen. Bitte warte eine Stunde, bevor du es erneut versuchst.",
          );
        } else if (data.already_verified) {
          setPhase("success");
        } else {
          setError("Code konnte nicht gesendet werden. Bitte versuche es erneut.");
        }
      } else {
        setChannel(ch);
        setCode("");
        setPhase("waiting_for_code");
      }
    } catch {
      setError("Verbindungsfehler. Bitte prüfe deine Internetverbindung.");
    } finally {
      setIsSending(false);
    }
  }

  // ── Verify code ─────────────────────────────────────────────────────────────
  const submitCode = useCallback(
    async (value: string) => {
      if (!leadId || value.length !== 6 || isVerifying) return;
      setIsVerifying(true);
      setError(null);

      try {
        const res = await fetch("/api/verify/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_id: leadId, phone: rawPhone, code: value }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (data.error === "invalid_code") {
            setError("Falscher Code. Bitte überprüfe deine Eingabe.");
          } else {
            setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
          }
          setCode("");
          setTimeout(() => inputRef.current?.focus(), 50);
        } else {
          clearInterval(countdownRef.current!);
          setPhase("success");
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
    [leadId, rawPhone, isVerifying, router],
  );

  // Auto-submit when 6 digits entered
  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    setError(null);
    if (val.length === 6) submitCode(val);
  }

  // ── Phases ──────────────────────────────────────────────────────────────────

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center text-center py-4 gap-5">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-1">
            Verifiziert ✓
          </p>
          <h2 className="font-heading text-xl font-semibold text-brand-text">
            Anfrage vollständig eingegangen
          </h2>
          <p className="text-sm text-brand-text-muted mt-2 leading-relaxed">
            Ein Solar-Experte aus deiner Region meldet sich in Kürze bei dir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-brand-text-muted mt-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> DSGVO-konform
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Geprüfte Fachbetriebe
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" /> Kostenlos & unverbindlich
          </span>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-brand-primary mt-1" />
      </div>
    );
  }

  // ── WAITING FOR CODE ────────────────────────────────────────────────────────
  if (phase === "waiting_for_code") {
    const isExpired = countdown === 0;

    return (
      <div className="flex flex-col gap-6">
        {/* Icon + heading */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
            {channel === "sms" ? (
              <MessageSquare className="w-6 h-6 text-brand-primary" />
            ) : (
              <span className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full bg-brand-primary/10 animate-ping opacity-40" />
                <PhoneCall className="w-6 h-6 text-brand-primary relative" />
              </span>
            )}
          </div>
          <h2 className="font-heading text-xl font-semibold text-brand-text">
            {channel === "sms" ? "Code per SMS unterwegs" : "Gleich klingelt dein Telefon"}
          </h2>
          <p className="text-sm text-brand-text-muted mt-1.5 leading-relaxed">
            {channel === "sms"
              ? `Wir haben dir einen 6-stelligen Code per SMS an ${maskPhone(rawPhone)} geschickt.`
              : `Wir rufen ${maskPhone(rawPhone)} gleich an und lesen dir einen 6-stelligen Code vor.`}
          </p>
        </div>

        {/* Code input — single large field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="otp-input" className="text-sm font-medium text-brand-text text-center">
            6-stelligen Code eingeben
          </label>
          <input
            id="otp-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            disabled={isVerifying || isExpired}
            placeholder="——————"
            className={[
              "w-full text-center text-3xl font-semibold tracking-[0.5em] py-4 rounded-xl border-2 outline-none transition-all",
              "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
              code.length > 0 ? "border-brand-primary bg-brand-primary/5" : "border-brand-border bg-white",
              isVerifying || isExpired ? "opacity-50 cursor-not-allowed" : "",
              error ? "border-red-400" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        {/* Submit button */}
        {code.length === 6 && !isVerifying && !isExpired && (
          <button
            onClick={() => submitCode(code)}
            className="w-full bg-brand-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-primary-hover transition-colors"
          >
            Bestätigen
          </button>
        )}

        {/* Loading */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-brand-text-muted">
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

        {/* Countdown */}
        <div className="flex flex-col items-center gap-2 text-sm">
          {isExpired ? (
            <p className="text-red-600 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Code abgelaufen
            </p>
          ) : (
            <p className="text-brand-text-muted flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Code gültig noch:{" "}
              <span className="font-medium tabular-nums">{formatTime(countdown)}</span>
            </p>
          )}

          {(showChannelLink || isExpired) && (
            <button
              onClick={() => { setError(null); setCode(""); setPhase("choosing_channel"); }}
              className="text-brand-primary text-sm font-medium hover:underline"
            >
              Anderen Kanal wählen
            </button>
          )}
        </div>

        {/* Support hint */}
        <p className="text-center text-xs text-brand-text-muted/70">
          Kein Code erhalten?{" "}
          <a href="mailto:support@autarkiejetzt.de" className="text-brand-primary hover:underline">
            support@autarkiejetzt.de
          </a>
        </p>
      </div>
    );
  }

  // ── CHOOSING CHANNEL ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-brand-text">
          Kurze Bestätigung erforderlich
        </h2>
        <p className="text-sm text-brand-text-muted mt-1.5">
          Wie möchtest du deinen Code erhalten?{" "}
          <span className="font-medium text-brand-text">{maskPhone(rawPhone)}</span>
        </p>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* SMS card */}
        <button
          onClick={() => isMobile && setChannel("sms")}
          disabled={!isMobile}
          className={[
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all",
            !isMobile
              ? "opacity-40 cursor-not-allowed border-brand-border bg-gray-50"
              : channel === "sms"
              ? "border-brand-primary bg-brand-primary/5 shadow-sm"
              : "border-brand-border bg-white hover:border-brand-primary/40",
          ].join(" ")}
        >
          <MessageSquare
            className={`w-7 h-7 ${channel === "sms" && isMobile ? "text-brand-primary" : "text-brand-text-muted"}`}
          />
          <div>
            <p className="font-semibold text-sm text-brand-text">SMS</p>
            <p className="text-xs text-brand-text-muted mt-0.5 leading-snug">
              {isMobile ? "Code per Textnachricht" : "Nur für Mobilnummern"}
            </p>
          </div>
          {channel === "sms" && isMobile && (
            <span className="mt-auto text-xs font-semibold text-brand-primary">✓ Ausgewählt</span>
          )}
        </button>

        {/* Call card */}
        <button
          onClick={() => setChannel("call")}
          className={[
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all",
            channel === "call"
              ? "border-brand-primary bg-brand-primary/5 shadow-sm"
              : "border-brand-border bg-white hover:border-brand-primary/40",
          ].join(" ")}
        >
          <Phone
            className={`w-7 h-7 ${channel === "call" ? "text-brand-primary" : "text-brand-text-muted"}`}
          />
          <div>
            <p className="font-semibold text-sm text-brand-text">Anruf</p>
            <p className="text-xs text-brand-text-muted mt-0.5 leading-snug">
              {!isMobile ? "Ideal für dein Festnetz" : "Code wird vorgelesen"}
            </p>
          </div>
          {channel === "call" && (
            <span className="mt-auto text-xs font-semibold text-brand-primary">✓ Ausgewählt</span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Send button */}
      <button
        onClick={() => handleSend(channel)}
        disabled={isSending}
        className="w-full bg-brand-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Wird gesendet …
          </>
        ) : (
          `Code per ${channel === "sms" ? "SMS" : "Anruf"} senden`
        )}
      </button>

      <p className="text-center text-xs text-brand-text-muted/70">
        Probleme?{" "}
        <a href="mailto:support@autarkiejetzt.de" className="text-brand-primary hover:underline">
          support@autarkiejetzt.de
        </a>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-brand-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
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

        <p className="text-center text-xs text-brand-text-muted mt-4">
          🔒 Deine Daten sind sicher. DSGVO-konform gespeichert.
        </p>
      </div>
    </main>
  );
}
