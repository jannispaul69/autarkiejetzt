import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum – Autarkie Jetzt",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-brand-surface py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand-text-muted hover:text-brand-text transition-colors mb-8 focus-visible:outline-none focus-visible:underline"
        >
          ← Zurück zur Startseite
        </Link>
        <h1 className="font-heading text-3xl font-extrabold text-brand-text mb-8 tracking-tight">
          Impressum
        </h1>
        <p className="text-brand-text-muted italic text-sm">[Inhalt folgt]</p>
      </div>
    </main>
  );
}
