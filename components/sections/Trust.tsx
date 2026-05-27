"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Gift, Clock4 } from "lucide-react";

const ITEMS = [
  {
    Icon: UserCheck,
    title: "Geprüfte Fachbetriebe",
    text: "Nur zertifizierte Installationsbetriebe mit Nachweis",
  },
  {
    Icon: ShieldCheck,
    title: "DSGVO-konform",
    text: "Deine Daten werden sicher übertragen und nicht weiterverkauft",
  },
  {
    Icon: Gift,
    title: "Kostenlos & unverbindlich",
    text: "Ohne versteckte Kosten oder Kaufverpflichtung",
  },
  {
    Icon: Clock4,
    title: "Rückmeldung in 24 h",
    text: "Dein Berater ruft innerhalb von 24 Stunden an",
  },
] as const;

export default function Trust() {
  return (
    <section className="bg-brand-primary py-8 sm:py-10" aria-label="Vertrauenspunkte">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {ITEMS.map(({ Icon, title, text }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
              }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                <Icon className="w-5 h-5 text-brand-accent" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-white font-medium text-sm leading-snug">{title}</p>
                <p className="text-white/65 text-xs leading-relaxed mt-0.5">{text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
