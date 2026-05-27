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
            <br />
            Grambkermoorer Landstraße 22G
            <br />
            28719 Bremen
          </p>
          <p>
            Handelsregister: HRB 38787
            <br />
            Registergericht: Amtsgericht Bremen
          </p>
          <p>
            Vertreten durch:
            <br />
            Jannis Schwietz (Geschäftsführer)
          </p>
        </Section>

        <Section title="Kontakt">
          <p>
            Telefon:{" "}
            <a
              href="tel:+4942140897615"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              0421 40897615
            </a>
          </p>
          <p>
            E-Mail:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
          </p>
        </Section>

        <Section title="Steuerliche Angaben">
          <p>
            Steuernummer: 60/129/20189
            <br />
            Finanzamt Bremen
          </p>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a
            Umsatzsteuergesetz:
            <br />
            DE358958147
          </p>
        </Section>

        <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <p>
            Jannis Schwietz
            <br />
            Grambkermoorer Landstraße 22G
            <br />
            28719 Bremen
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
            Wir sind nicht verpflichtet und nicht bereit, an einem
            Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </Section>

        <Section title="Haftung für Inhalte">
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
            Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
            verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
            gespeicherte fremde Informationen zu überwachen oder nach
            Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
            hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
            Informationen nach den allgemeinen Gesetzen bleiben hiervon
            unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
            Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
            möglich. Bei Bekanntwerden von entsprechenden
            Rechtsverletzungen werden wir diese Inhalte umgehend
            entfernen.
          </p>
        </Section>

        <Section title="Haftung für Links">
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf
            deren Inhalte wir keinen Einfluss haben. Deshalb können wir
            für diese fremden Inhalte auch keine Gewähr übernehmen. Für
            die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
          <p>
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
            mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
            waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
            permanente inhaltliche Kontrolle der verlinkten Seiten ist
            jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
            nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
            werden wir derartige Links umgehend entfernen.
          </p>
        </Section>
      </div>
    </main>
  );
}
