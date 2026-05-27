import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AGB – Autarkie Jetzt",
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
      <div className="text-brand-text-muted leading-[1.8] space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function AgbPage() {
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
          Allgemeine Nutzungsbedingungen
        </h1>
        <p className="text-sm text-brand-text-muted mb-10">Stand: Mai 2026</p>

        <Section title="§ 1 Geltungsbereich und Anbieter">
          <p>
            Diese Nutzungsbedingungen gelten für die Nutzung des
            kostenlosen Beratungsvermittlungsportals{" "}
            <strong className="text-brand-text font-medium">
              autarkiejetzt.de
            </strong>{" "}
            der Schwietz Holding UG (haftungsbeschränkt),
            Grambkermoorer Landstraße 22G, 28719 Bremen (nachfolgend
            &bdquo;Anbieter&rdquo;).
          </p>
          <p>
            Mit dem Absenden des Beratungsformulars erklärt der Nutzer
            sein Einverständnis mit diesen Nutzungsbedingungen.
          </p>
        </Section>

        <Section title="§ 2 Leistungsbeschreibung">
          <p>
            Der Anbieter betreibt ein Online-Portal zur unentgeltlichen
            Vermittlung von Beratungsanfragen zwischen Hausbesitzern und
            regionalen Photovoltaik-Fachbetrieben. Die Nutzung des
            Portals ist für Endnutzer vollständig kostenlos und
            unverbindlich.
          </p>
          <p>Es besteht kein Anspruch auf:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Kontaktaufnahme durch einen Fachbetrieb</li>
            <li>Abschluss eines Installationsvertrags</li>
            <li>ein bestimmtes Angebot oder einen bestimmten Preis</li>
          </ul>
          <p>
            Der Anbieter ist lediglich Vermittler und wird nicht
            Vertragspartei eines etwaigen Installations- oder
            Beratungsvertrags zwischen Nutzer und Fachbetrieb.
          </p>
        </Section>

        <Section title="§ 3 Voraussetzungen zur Nutzung">
          <p>Die Nutzung setzt voraus, dass der Nutzer:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              Eigentümer der angegebenen Immobilie ist oder eine
              entsprechende Vollmacht des Eigentümers besitzt,
            </li>
            <li>das 18. Lebensjahr vollendet hat,</li>
            <li>alle Angaben wahrheitsgemäß und vollständig macht.</li>
          </ul>
          <p>
            Die Nutzung durch Mieter ohne Vollmacht des Eigentümers ist
            ausgeschlossen, da ohne Eigentümerstatus in der Regel keine
            rechtliche Grundlage für die Installation einer
            Photovoltaikanlage besteht.
          </p>
        </Section>

        <Section title="§ 4 Einwilligung und Datenweitergabe">
          <p>
            Mit dem Absenden des Formulars willigt der Nutzer
            ausdrücklich gemäß Art. 6 Abs. 1 lit. a DSGVO ein, dass
            seine im Formular angegebenen Daten (Name, Kontaktdaten,
            Immobilieninformationen) zum Zweck der
            Beratungsvermittlung an einen einzigen regionalen
            Photovoltaik-Fachbetrieb weitergegeben werden.
          </p>
          <p>
            Eine Mehrfachweitergabe der Daten findet nicht statt. Die
            Einwilligung kann jederzeit mit Wirkung für die Zukunft
            widerrufen werden (siehe Datenschutzerklärung).
          </p>
        </Section>

        <Section title="§ 5 Haftungsausschluss">
          <p>Der Anbieter übernimmt keine Gewähr für:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>die Qualität der Beratung durch Fachbetriebe,</li>
            <li>
              die Richtigkeit oder Vollständigkeit von Angeboten oder
              Preisen,
            </li>
            <li>den Abschluss eines Vertrags.</li>
          </ul>
          <p>
            Der Anbieter ist nicht Partei des Vertragsverhältnisses
            zwischen Nutzer und Fachbetrieb. Eine Haftung des Anbieters
            für Schäden, die aus dem Vertragsverhältnis zwischen Nutzer
            und Fachbetrieb entstehen, ist ausgeschlossen.
          </p>
          <p>
            Die Haftung des Anbieters für Schäden aus der Nutzung des
            Portals ist – soweit gesetzlich zulässig – auf Vorsatz und
            grobe Fahrlässigkeit beschränkt. Die Haftung für
            Personenschäden bleibt unberührt.
          </p>
        </Section>

        <Section title="§ 6 Verfügbarkeit">
          <p>
            Der Anbieter bemüht sich um eine hohe Verfügbarkeit des
            Portals, übernimmt jedoch keine Garantie für ununterbrochene
            Erreichbarkeit. Wartungsarbeiten oder technische Störungen
            können zu vorübergehenden Einschränkungen führen. Aus einer
            vorübergehenden Nichtverfügbarkeit entstehen keine
            Ansprüche gegenüber dem Anbieter.
          </p>
        </Section>

        <Section title="§ 7 Änderungen der Nutzungsbedingungen">
          <p>
            Der Anbieter behält sich vor, diese Nutzungsbedingungen
            jederzeit mit Wirkung für die Zukunft zu ändern. Die jeweils
            aktuelle Fassung ist unter{" "}
            <strong className="text-brand-text font-medium">
              autarkiejetzt.de/agb
            </strong>{" "}
            abrufbar. Die weitere Nutzung des Portals nach einer
            Änderung gilt als Zustimmung zur geänderten Fassung.
          </p>
        </Section>

        <Section title="§ 8 Schlussbestimmungen">
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland unter
            Ausschluss des UN-Kaufrechts.
          </p>
          <p>
            Gerichtsstand für alle Streitigkeiten aus oder im
            Zusammenhang mit diesen Nutzungsbedingungen ist Bremen,
            soweit der Nutzer Kaufmann, juristische Person des
            öffentlichen Rechts oder öffentlich-rechtliches
            Sondervermögen ist oder keinen allgemeinen Gerichtsstand in
            Deutschland hat.
          </p>
          <p>
            Sollten einzelne Bestimmungen dieser Nutzungsbedingungen
            unwirksam sein oder werden, bleibt die Wirksamkeit der
            übrigen Bestimmungen unberührt. Die unwirksame Bestimmung
            ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen
            Zweck der unwirksamen Bestimmung möglichst nahekommt.
          </p>
        </Section>
      </div>
    </main>
  );
}
