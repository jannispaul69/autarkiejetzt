"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "Was kostet die Solar-Beratung?",
    a: "Die Anfrage und Beratung ist vollständig kostenlos und unverbindlich. Du gehst keinerlei Verpflichtung ein – weder bei der Anfrage noch beim Beratungsgespräch.",
  },
  {
    q: "Wer nimmt sich meiner Anfrage an?",
    a: "Wir vermitteln dich an einen einzigen geprüften Solar-Fachbetrieb aus deiner Region – keinen Vertriebler, sondern einen Handwerksbetrieb, der auch installiert. Dieser meldet sich innerhalb von 24 Stunden bei dir.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Deine Daten werden ausschließlich an diesen einen Fachbetrieb weitergegeben. Keine Weitergabe an weitere Dritte, kein Spam, kein Verkauf deiner Daten. Wir halten uns strikt an die DSGVO.",
  },
  {
    q: "Lohnt sich eine Solaranlage für mein Haus?",
    a: "Das hängt von deinem Dach, deinem Stromverbrauch und deiner Region ab. Dein Fachberater berechnet das kostenlos für dich – auf Basis deiner konkreten Situation, nicht anhand von Durchschnittswerten.",
  },
  {
    q: "Wie lange dauert eine Installation?",
    a: "In der Regel 1–2 Arbeitstage für die Montage. Der Fachbetrieb kümmert sich auch um behördliche Genehmigungen und die Anmeldung beim Netzbetreiber – du musst dich um nichts weiter kümmern.",
  },
  {
    q: "Welche Förderungen gibt es?",
    a: "Einspeisetarife nach dem EEG, KfW-Förderkredite und steuerliche Vorteile machen PV-Anlagen oft deutlich günstiger als erwartet. Dein Berater informiert dich über alle aktuell verfügbaren Möglichkeiten für deine Situation.",
  },
] as const;

export default function FAQ() {
  return (
    <section className="bg-brand-background py-20 lg:py-28" aria-labelledby="faq-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-primary mb-3">
            Häufige Fragen
          </p>
          <h2
            id="faq-heading"
            className="font-heading text-brand-text tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 }}
          >
            Alles, was du wissen möchtest
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <Accordion multiple={false} className="flex flex-col gap-3">
            {QUESTIONS.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-white rounded-xl border border-brand-border px-5 shadow-sm data-open:shadow-md transition-shadow duration-200"
              >
                <AccordionTrigger className="py-4 text-left font-medium text-brand-text text-[0.9375rem] hover:no-underline [&>svg]:text-brand-primary">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-brand-text-muted text-sm leading-relaxed pb-4">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
