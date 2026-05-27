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
      <div className="text-brand-text-muted leading-[1.8] space-y-2">
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
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-sm text-brand-text-muted mb-10">Stand: Mai 2026</p>

        <Section title="§ 1 Geltungsbereich">
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die
            kostenlose Nutzung des Beratungsvermittlungsportals{" "}
            <strong className="text-brand-text font-medium">
              autarkiejetzt.de
            </strong>{" "}
            der Schwietz Holding UG (haftungsbeschränkt),
            Grambkermoorer Landstr. 22G, 28719 Bremen (nachfolgend
            „Betreiber").
          </p>
          <p>
            Mit dem Absenden des Beratungsformulars erklärt der Nutzer
            sein Einverständnis mit diesen AGB.
          </p>
        </Section>

        <Section title="§ 2 Leistungsbeschreibung">
          <p>
            autarkiejetzt.de vermittelt kostenlose und unverbindliche
            Beratungsanfragen von Hausbesitzern an regionale
            Photovoltaik-Fachbetriebe. Die Leistung ist für Endnutzer
            vollständig kostenlos.
          </p>
          <p>
            Es besteht kein Anspruch auf Kontaktaufnahme durch einen
            Installateur oder auf den Abschluss eines
            Installationsvertrags. Der Betreiber ist lediglich
            Vermittler und wird nicht Vertragspartei eines etwaigen
            Installations- oder Beratungsvertrags zwischen Nutzer und
            Fachbetrieb.
          </p>
        </Section>

        <Section title="§ 3 Voraussetzungen zur Nutzung">
          <p>
            Die Nutzung des Portals setzt voraus, dass der Nutzer:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              das 18. Lebensjahr vollendet hat,
            </li>
            <li>
              Eigentümer oder bevollmächtigter Vertreter des Eigentümers
              der angegebenen Immobilie ist,
            </li>
            <li>
              wahrheitsgemäße Angaben im Formular macht.
            </li>
          </ul>
          <p>
            Die Nutzung durch Mieter ist ausgeschlossen, da ohne
            Eigentümer-Status in der Regel keine Möglichkeit zur
            Installation einer Photovoltaikanlage besteht.
          </p>
        </Section>

        <Section title="§ 4 Einwilligung zur Datenweitergabe">
          <p>
            Mit dem Absenden des Formulars willigt der Nutzer
            ausdrücklich ein, dass seine im Formular angegebenen Daten
            (Name, Kontaktdaten, Immobilieninformationen) zum Zweck der
            Beratungsvermittlung an einen regionalen
            Photovoltaik-Fachbetrieb weitergegeben werden.
          </p>
          <p>
            Die Datenweitergabe erfolgt exklusiv an einen einzigen
            Fachbetrieb. Kein Mehrfachverkauf der Daten. Die
            Einwilligung kann jederzeit mit Wirkung für die Zukunft
            widerrufen werden (siehe Datenschutzerklärung).
          </p>
        </Section>

        <Section title="§ 5 Haftungsausschluss">
          <p>
            Der Betreiber übernimmt keine Haftung für die Qualität,
            Vollständigkeit oder Richtigkeit der durch die Fachbetriebe
            erbrachten Beratungs- oder Installationsleistungen. Die
            Schwietz Holding UG ist nicht Partei des
            Vertragsverhältnisses zwischen Nutzer und Fachbetrieb.
          </p>
          <p>
            Der Betreiber haftet nicht für Schäden, die durch die
            Nutzung des Portals entstehen, sofern diese nicht auf grober
            Fahrlässigkeit oder Vorsatz des Betreibers beruhen.
          </p>
        </Section>

        <Section title="§ 6 Schlussbestimmungen">
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland unter
            Ausschluss des UN-Kaufrechts.
          </p>
          <p>
            Gerichtsstand für alle Streitigkeiten aus oder im
            Zusammenhang mit diesen AGB ist Bremen, sofern der Nutzer
            Kaufmann, juristische Person des öffentlichen Rechts oder
            öffentlich-rechtliches Sondervermögen ist oder keinen
            allgemeinen Gerichtsstand in Deutschland hat.
          </p>
          <p>
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein
            oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
            unberührt.
          </p>
        </Section>
      </div>
    </main>
  );
}
