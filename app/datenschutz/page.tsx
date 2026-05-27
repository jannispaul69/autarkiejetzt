import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Autarkie Jetzt",
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

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>
        <p className="text-sm text-brand-text-muted mb-10">Stand: Mai 2026</p>

        <Section title="§ 1 Verantwortlicher">
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung
            (DSGVO) ist:
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Schwietz Holding UG (haftungsbeschränkt)
            </strong>
            <br />
            Grambkermoorer Landstr. 22G
            <br />
            28719 Bremen
            <br />
            E-Mail:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
            <br />
            Telefon: [TELEFON_PLATZHALTER]
          </p>
        </Section>

        <Section title="§ 2 Welche Daten wir erheben">
          <p>
            Beim Ausfüllen des Beratungsformulars auf autarkiejetzt.de
            erheben wir folgende personenbezogene Daten:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Name und Vorname</li>
            <li>Anschrift (Straße, PLZ, Ort)</li>
            <li>Telefonnummer</li>
            <li>E-Mail-Adresse</li>
            <li>
              Informationen zur Immobilie: Wohnsituation, Gebäudetyp,
              Dachausrichtung, jährlicher Stromverbrauch, gewünschter
              Zeithorizont und Motivation
            </li>
          </ul>
          <p>
            Zusätzlich werden beim Aufruf unserer Website automatisch
            technische Daten erfasst:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>IP-Adresse (anonymisiert gespeichert)</li>
            <li>Browser-Typ und -Version</li>
            <li>Betriebssystem</li>
            <li>Referrer-URL</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>UTM-Parameter (Kampagnentracking)</li>
          </ul>
        </Section>

        <Section title="§ 3 Zweck und Rechtsgrundlage der Verarbeitung">
          <p>
            Die erhobenen Daten werden ausschließlich zum Zweck der
            Vermittlung einer kostenlosen Photovoltaik-Beratung durch
            einen regionalen Fachbetrieb verarbeitet.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Rechtsgrundlage:
            </strong>{" "}
            Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Einwilligung
            erfolgt ausdrücklich durch das Aktivieren der Checkbox im
            Beratungsformular vor dem Absenden. Ohne diese Einwilligung
            ist eine Übermittlung der Anfrage nicht möglich.
          </p>
        </Section>

        <Section title="§ 4 Weitergabe an Dritte">
          <p>
            Nach Eingang einer vollständigen Anfrage wird der Datensatz
            exklusiv an einen einzigen regionalen
            Photovoltaik-Installateur weitergegeben. Eine
            Mehrfachweitergabe oder der Verkauf der Daten an weitere
            Dritte findet nicht statt.
          </p>
          <p>
            Mit der Datenweitergabe wird der empfangende Fachbetrieb
            eigenständiger Verantwortlicher im Sinne der DSGVO für die
            weitere Verarbeitung Ihrer Daten im Rahmen der
            Beratungsanbahnung.
          </p>
          <p>
            Eine Übermittlung in Drittländer findet im Rahmen der
            Datenweitergabe an den Fachbetrieb nicht statt. Für die
            eingesetzten Dienstleister gilt § 5 dieser Erklärung.
          </p>
        </Section>

        <Section title="§ 5 Eingesetzte Dienstleister (Auftragsverarbeiter)">
          <p>
            Wir setzen folgende Dienstleister ein, mit denen
            Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO
            abgeschlossen wurden:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-1">
            <li>
              <strong className="text-brand-text font-medium">
                Vercel Inc.
              </strong>{" "}
              (Hosting, USA) – Datenübermittlung in die USA auf
              Grundlage von Standardvertragsklauseln gemäß Art. 46
              DSGVO.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Supabase Inc.
              </strong>{" "}
              (Datenbank) – Datenspeicherung in der EU-Region Frankfurt
              (AWS eu-central-1). EU-Hosting ohne Drittlandübermittlung.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Resend Inc.
              </strong>{" "}
              (E-Mail-Versand, USA) – Datenübermittlung in die USA auf
              Grundlage von Standardvertragsklauseln gemäß Art. 46
              DSGVO. Verarbeitung beschränkt auf E-Mail-Adresse und
              Name des Anfragenden.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Meta Platforms Ireland Ltd.
              </strong>{" "}
              (Marketing/Analytics via Meta Pixel) – Einbindung nur bei
              ausdrücklicher Einwilligung über den Cookie Banner.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Weitere
              Informationen:{" "}
              <a
                href="https://www.facebook.com/privacy/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
              >
                https://www.facebook.com/privacy/policy
              </a>
            </li>
          </ul>
        </Section>

        <Section title="§ 6 Speicherdauer">
          <p>
            Lead-Daten (Formularinhalte) werden nach Abschluss des
            Vermittlungsvorgangs, spätestens jedoch nach{" "}
            <strong className="text-brand-text font-medium">
              24 Monaten
            </strong>
            , gelöscht, sofern keine gesetzlichen
            Aufbewahrungspflichten (insbesondere handels- und
            steuerrechtliche Fristen) entgegenstehen.
          </p>
          <p>
            Technische Zugriffsdaten (Server-Logs) werden nach 30 Tagen
            automatisch gelöscht.
          </p>
        </Section>

        <Section title="§ 7 Ihre Rechte als betroffene Person">
          <p>
            Ihnen stehen gemäß DSGVO folgende Rechte zu:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              <strong className="text-brand-text font-medium">
                Auskunft
              </strong>{" "}
              (Art. 15 DSGVO): Recht auf Auskunft über die zu Ihrer
              Person gespeicherten Daten.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Berichtigung
              </strong>{" "}
              (Art. 16 DSGVO): Recht auf Korrektur unrichtiger Daten.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Löschung
              </strong>{" "}
              (Art. 17 DSGVO): Recht auf Löschung Ihrer Daten,
              soweit keine gesetzlichen Aufbewahrungspflichten
              entgegenstehen.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Einschränkung der Verarbeitung
              </strong>{" "}
              (Art. 18 DSGVO).
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Datenübertragbarkeit
              </strong>{" "}
              (Art. 20 DSGVO).
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Widerspruch
              </strong>{" "}
              (Art. 21 DSGVO): Recht auf Widerspruch gegen die
              Verarbeitung.
            </li>
            <li>
              <strong className="text-brand-text font-medium">
                Widerruf der Einwilligung
              </strong>{" "}
              (Art. 7 Abs. 3 DSGVO): Recht auf jederzeitigen Widerruf
              einer erteilten Einwilligung ohne Angabe von Gründen.
            </li>
          </ul>
          <p>
            Zur Geltendmachung Ihrer Rechte wenden Sie sich bitte per
            E-Mail an:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
          </p>
          <p>
            Sie haben zudem das Recht, sich bei der zuständigen
            Datenschutzaufsichtsbehörde zu beschweren:{" "}
            <strong className="text-brand-text font-medium">
              Der Landesbeauftragte für Datenschutz und
              Informationsfreiheit der Freien Hansestadt Bremen
            </strong>
            , Arndtstraße 1, 27570 Bremerhaven,{" "}
            <a
              href="https://www.datenschutz.bremen.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              www.datenschutz.bremen.de
            </a>
          </p>
        </Section>

        <Section title="§ 8 Widerruf der Einwilligung">
          <p>
            Die mit dem Formular erteilte Einwilligung zur
            Datenweitergabe an einen Photovoltaik-Fachbetrieb kann
            jederzeit mit Wirkung für die Zukunft widerrufen werden.
          </p>
          <p>
            Bitte senden Sie Ihren Widerruf per E-Mail an{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>{" "}
            unter Angabe Ihrer bei der Anfrage verwendeten E-Mail-Adresse.
          </p>
          <p>
            Der Widerruf berührt nicht die Rechtmäßigkeit der aufgrund
            der Einwilligung bis zum Widerruf erfolgten Verarbeitung.
            Bitte beachten Sie, dass eine bereits erfolgte Weitergabe
            an den Fachbetrieb nicht rückgängig gemacht werden kann.
          </p>
        </Section>

        <Section title="§ 9 Cookies und Tracking">
          <p>
            <strong className="text-brand-text font-medium">
              Technisch notwendig (keine Einwilligung erforderlich):
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              <code className="text-sm bg-brand-background px-1.5 py-0.5 rounded">
                aj_form_state
              </code>{" "}
              – localStorage-Eintrag zur Zwischenspeicherung des
              Formularfortschritts. Kein Cookie, keine
              Server-Übertragung. Wird nach dem Absenden des Formulars
              automatisch gelöscht.
            </li>
          </ul>
          <p>
            <strong className="text-brand-text font-medium">
              Marketing (nur mit Einwilligung):
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              <strong className="text-brand-text font-medium">
                Meta Pixel
              </strong>{" "}
              von Meta Platforms Ireland Ltd., 4 Grand Canal Square,
              Dublin 2, Irland – Zur Messung und Optimierung unserer
              Werbekampagnen auf Facebook und Instagram.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO.
            </li>
          </ul>
          <p>
            Die Einwilligung für Marketing-Cookies kann jederzeit über
            den Cookie Banner auf dieser Website widerrufen werden.
            Klicken Sie dazu im Footer auf{" "}
            <strong className="text-brand-text font-medium">
              „Cookie-Einstellungen"
            </strong>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}
