import type { Metadata } from "next";
import Link from "next/link";
import DeletionRequestForm from "@/components/DeletionRequestForm";

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

        <Section title="1. Verantwortlicher">
          <p>
            <strong className="text-brand-text font-medium">
              Schwietz Holding UG (haftungsbeschränkt)
            </strong>
            <br />
            Grambkermoorer Landstraße 22G, 28719 Bremen
            <br />
            Telefon:{" "}
            <a
              href="tel:+4942140897615"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              0421 40897615
            </a>
            <br />
            E-Mail:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
          </p>
        </Section>

        <Section title="2. Grundsätze der Datenverarbeitung">
          <p>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur
            Bereitstellung unserer Leistungen erforderlich ist und eine
            Rechtsgrundlage nach Art. 6 DSGVO vorliegt. Wir erheben
            keine Daten, die über den für die Leistungserbringung
            notwendigen Umfang hinausgehen.
          </p>
        </Section>

        <Section title="3. Welche Daten wir erheben">
          <p>
            Beim Ausfüllen unseres Beratungsformulars erheben wir:
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Kontaktdaten:
            </strong>{" "}
            Vor- und Nachname, Postanschrift, Telefonnummer,
            E-Mail-Adresse.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Objektdaten:
            </strong>{" "}
            Wohnsituation (Eigentümer/Mieter), Gebäudetyp,
            Dachausrichtung, Stromverbrauch, gewünschter
            Umsetzungszeitraum, Hauptmotivation.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Technische Daten:
            </strong>{" "}
            IP-Adresse, Browser-Informationen, Zeitstempel,
            Referrer-URL, UTM-Parameter (Herkunft der Anfrage).
          </p>
        </Section>

        <Section title="4. Zweck und Rechtsgrundlage der Verarbeitung">
          <p>
            Wir verarbeiten Ihre Daten ausschließlich zum Zweck der
            Vermittlung einer kostenlosen und unverbindlichen
            Photovoltaik-Beratung durch einen regionalen Fachbetrieb.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Rechtsgrundlage:
            </strong>{" "}
            Art. 6 Abs. 1 lit. a DSGVO (ausdrückliche Einwilligung).
            Die Einwilligung erteilen Sie durch das aktive Setzen der
            Checkboxen im Formular vor dem Absenden.
          </p>
        </Section>

        <Section title="5. Weitergabe Ihrer Daten an Dritte">
          <p>
            Nach Eingang Ihrer Anfrage wird Ihr Datensatz
            ausschließlich an einen einzigen regionalen
            Photovoltaik-Fachbetrieb weitergegeben. Es findet
            kein Mehrfachverkauf statt, und es erfolgt keine
            Weitergabe an weitere Dritte.
          </p>
          <p>
            Mit der Weitergabe wird dieser Fachbetrieb eigenständiger
            Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO für die
            weitere Verarbeitung Ihrer Daten im Rahmen der
            Beratungsanbahnung.
          </p>
        </Section>

        <Section title="6. Eingesetzte Dienstleister">
          <p>
            Zur Bereitstellung unserer Dienste setzen wir folgende
            Auftragsverarbeiter gemäß Art. 28 DSGVO ein:
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Vercel Inc.
            </strong>{" "}
            (Hosting) – 340 Pine Street, Suite 701, San Francisco,
            CA 94104, USA. Datenübermittlung in die USA auf Basis von
            Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Supabase Inc.
            </strong>{" "}
            (Datenbankhosting) – 970 Toa Payoh North, Singapur. Unsere
            Datenbank wird in der Region eu-central-1 (Frankfurt,
            Deutschland) betrieben – Daten verlassen die EU nicht.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Resend Inc.
            </strong>{" "}
            (E-Mail-Versand) – 2261 Market Street #5202, San Francisco,
            CA 94114, USA. Datenübermittlung in die USA auf Basis von
            Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Meta Platforms Ireland Ltd.
            </strong>{" "}
            (Meta Pixel) – 4 Grand Canal Square, Dublin 2, Irland. Nur
            bei erteilter Cookie-Einwilligung aktiv. Weitere
            Informationen:{" "}
            <a
              href="https://www.facebook.com/privacy/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              https://www.facebook.com/privacy/policy
            </a>
          </p>
        </Section>

        <Section title="7. Speicherdauer">
          <p>
            Ihre Lead-Daten werden nach Abschluss des
            Vermittlungsvorgangs, spätestens nach{" "}
            <strong className="text-brand-text font-medium">
              24 Monaten
            </strong>
            , gelöscht – sofern keine gesetzlichen
            Aufbewahrungspflichten entgegenstehen.
          </p>
          <p>
            Technische Protokolldaten (IP-Adresse, Zeitstempel) werden
            nach spätestens 30 Tagen gelöscht.
          </p>
        </Section>

        <Section title="8. Ihre Rechte als betroffene Person">
          <p>Sie haben das Recht auf:</p>
          <p>
            <strong className="text-brand-text font-medium">
              Auskunft
            </strong>{" "}
            (Art. 15 DSGVO): Welche Daten wir von Ihnen gespeichert
            haben.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Berichtigung
            </strong>{" "}
            (Art. 16 DSGVO): Korrektur unrichtiger Daten.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Löschung
            </strong>{" "}
            (Art. 17 DSGVO): Löschung Ihrer Daten, sofern keine
            gesetzliche Aufbewahrungspflicht besteht.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Einschränkung
            </strong>{" "}
            (Art. 18 DSGVO): Einschränkung der Verarbeitung Ihrer Daten.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Datenübertragbarkeit
            </strong>{" "}
            (Art. 20 DSGVO): Erhalt Ihrer Daten in einem gängigen
            Format.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Widerspruch
            </strong>{" "}
            (Art. 21 DSGVO): Widerspruch gegen die Verarbeitung.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Widerruf der Einwilligung
            </strong>{" "}
            (Art. 7 Abs. 3 DSGVO): Sie können Ihre Einwilligung
            jederzeit mit Wirkung für die Zukunft widerrufen. Der
            Widerruf berührt nicht die Rechtmäßigkeit der bis dahin
            erfolgten Verarbeitung.
          </p>
          <p>
            Zur Ausübung Ihrer Rechte wenden Sie sich per E-Mail an:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
          </p>
          <p>
            Wir antworten innerhalb von 30 Tagen (Art. 12 DSGVO).
          </p>
        </Section>

        <Section title="9. Widerruf der Einwilligung zur Datenweitergabe">
          <p>
            Haben Sie in die Weitergabe Ihrer Daten an einen
            Photovoltaik-Fachbetrieb eingewilligt, können Sie diese
            Einwilligung jederzeit widerrufen:
          </p>
          <p>
            Per E-Mail an:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de?subject=Widerruf%20Einwilligung%20Datenweitergabe"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
            <br />
            Betreff: &bdquo;Widerruf Einwilligung Datenweitergabe&rdquo;
            <br />
            Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an.
          </p>
          <p>
            Wir löschen Ihren Datensatz umgehend und informieren den
            ggf. bereits benachrichtigten Fachbetrieb über den Widerruf.
          </p>
        </Section>

        <Section title="10. Recht auf Datenlöschung">
          <p>
            Sie haben das Recht, die Löschung Ihrer personenbezogenen
            Daten zu verlangen, wenn:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>der Zweck der Verarbeitung entfallen ist,</li>
            <li>Sie Ihre Einwilligung widerrufen haben,</li>
            <li>die Daten unrechtmäßig verarbeitet wurden.</li>
          </ul>
          <p>
            Löschungsanfragen richten Sie an:{" "}
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              anfrage@autarkiejetzt.de
            </a>
            . Wir bestätigen die Löschung innerhalb von 30 Tagen.
          </p>
        </Section>

        <Section title="11. Cookies und Tracking">
          <p>
            <strong className="text-brand-text font-medium">
              Technisch notwendig (keine Einwilligung erforderlich):
            </strong>
          </p>
          <p>
            Wir nutzen den localStorage Ihres Browsers ausschließlich
            zur temporären Speicherung Ihrer Formulareingaben während
            des Ausfüllvorgangs (Schlüssel:{" "}
            <code className="text-sm bg-brand-background px-1.5 py-0.5 rounded">
              aj_form_state
            </code>
            ). Diese Daten verlassen Ihr Gerät nicht und werden nach dem
            Absenden des Formulars automatisch gelöscht.
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Nur mit Ihrer Einwilligung:
            </strong>
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Meta Pixel
            </strong>{" "}
            von Meta Platforms Ireland Ltd., 4 Grand Canal Square,
            Dublin 2, Irland – zur Messung und Optimierung unserer
            Werbekampagnen auf Facebook und Instagram. Das Pixel wird
            nur nach Ihrer ausdrücklichen Einwilligung über unseren
            Cookie Banner geladen. Rechtsgrundlage: Art. 6 Abs. 1
            lit. a DSGVO.
          </p>
          <p>
            Cookie-Einwilligung widerrufen: Klicken Sie im Footer auf{" "}
            <strong className="text-brand-text font-medium">
              &bdquo;Cookie-Einstellungen&rdquo;
            </strong>{" "}
            und wählen Sie &bdquo;Nur notwendige Cookies&rdquo;.
          </p>
        </Section>

        <Section title="12. Beschwerderecht">
          <p>
            Sie haben das Recht, sich bei der zuständigen
            Datenschutzaufsichtsbehörde zu beschweren:
          </p>
          <p>
            <strong className="text-brand-text font-medium">
              Der Landesbeauftragte für Datenschutz und
              Informationsfreiheit der Freien Hansestadt Bremen
            </strong>
            <br />
            Arndtstraße 1, 27570 Bremerhaven
            <br />
            E-Mail:{" "}
            <a
              href="mailto:office@datenschutz.bremen.de"
              className="text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              office@datenschutz.bremen.de
            </a>
            <br />
            Tel.: 0421 361-2010
          </p>
        </Section>

        {/* Automated deletion form */}
        <div className="mt-4 mb-12">
          <DeletionRequestForm />
        </div>
      </div>
    </main>
  );
}
