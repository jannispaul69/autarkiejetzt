import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum – Autarkie Jetzt",
  robots: { index: false },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-lg font-bold text-brand-text mb-3 tracking-tight">
        {title}
      </h2>
      <div className="text-brand-text-muted leading-[1.8] space-y-2">
        {children}
      </div>
    </section>
  );
}

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

        <h1 className="font-heading text-3xl font-extrabold text-brand-primary mb-2 tracking-tight">
          Impressum
        </h1>
        <p className="text-sm text-brand-text-muted mb-10">Stand: Mai 2026</p>

        <Section title="Angaben gemäß § 5 TMG">
          <p>
            <strong className="text-brand-text font-medium">
              Schwietz Holding UG (haftungsbeschränkt)
            </strong>
          </p>
          <p>
            Grambkermoorer Landstr. 22G
            <br />
            28719 Bremen
          </p>
          <p>
            Handelsregister: HRB 38787
            <br />
            Registergericht: Amtsgericht Bremen
          </p>
          <p>
            Geschäftsführer: Jannis Schwietz
          </p>
        </Section>

        <Section title="Kontakt">
          <p>
            E-Mail:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
          </p>
          <p>Telefon: [TELEFON_PLATZHALTER]</p>
        </Section>

        <Section title="Umsatzsteuer-Identifikationsnummer">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a
            Umsatzsteuergesetz: [UST_PLATZHALTER]
          </p>
        </Section>

        <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <p>
            Jannis Schwietz
            <br />
            Grambkermoorer Landstr. 22G
            <br />
            28719 Bremen
          </p>
        </Section>

        <Section title="Aufsichtsbehörde">
          <p>
            Die Tätigkeit der Schwietz Holding UG unterliegt keiner
            besonderen behördlichen Zulassung und keiner Aufsicht durch
            eine Regulierungsbehörde. Es handelt sich nicht um einen
            reglementierten Beruf.
          </p>
        </Section>

        <Section title="EU-Streitschlichtung">
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p>
            Unsere E-Mail-Adresse lautet: anfrage@autarkiejetzt.de
          </p>
          <p>
            Wir sind nicht verpflichtet und nicht bereit, an einem
            Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </Section>
      </div>
    </main>
  );
}
