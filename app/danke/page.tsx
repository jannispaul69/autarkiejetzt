import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Vielen Dank! – Autarkie Jetzt",
  description:
    "Deine Anfrage ist eingegangen. Ein Fachbetrieb meldet sich innerhalb von 24 Stunden.",
  robots: { index: false },
};

const TRUST_CHIPS = [
  { Icon: CheckCircle2, text: "Kostenlos & unverbindlich" },
  { Icon: Clock, text: "Rückruf in 24 Stunden" },
  { Icon: Shield, text: "DSGVO-konform" },
] as const;

export default function DankePage() {
  return (
    <main className="min-h-screen bg-brand-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle2
            className="w-16 h-16 text-brand-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-3xl font-bold text-brand-text mb-3 tracking-tight">
          Vielen Dank für deine Anfrage!
        </h1>

        {/* Subtext */}
        <p className="text-brand-text-muted leading-relaxed mb-8">
          Deine Anfrage ist erfolgreich eingegangen. Ein geprüfter Solar-Fachbetrieb
          aus deiner Region meldet sich innerhalb von{" "}
          <strong className="text-brand-text font-medium">24 Stunden</strong>{" "}
          telefonisch bei dir.
        </p>

        {/* Trust chips */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {TRUST_CHIPS.map(({ Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-medium"
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
              {text}
            </div>
          ))}
        </div>

        {/* Advice */}
        <div className="bg-brand-accent/15 border border-brand-accent/40 rounded-xl px-5 py-4 mb-8 text-left">
          <p className="text-sm font-medium text-brand-text mb-1">
            Tipp: Halte dein Telefon bereit
          </p>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Dein Berater ruft dich an, um deine Situation zu besprechen und ein
            kostenloses Angebot zu erstellen. Das Gespräch dauert ca. 10–15 Minuten.
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand-text-muted hover:text-brand-text transition-colors focus-visible:outline-none focus-visible:underline"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
