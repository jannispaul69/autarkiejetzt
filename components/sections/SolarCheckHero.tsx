import Image from "next/image";
import Link from "next/link";
import { Check, Shield, FileSearch } from "lucide-react";
import SolarCheckForm from "@/components/form/solar-check/SolarCheckForm";

export default function SolarCheckHero() {
  return (
    <section className="bg-brand-background">

      {/* Logo nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <Link
          href="/"
          className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-sm"
          aria-label="Autarkie Jetzt – zur Startseite"
        >
          <Image
            src="/logo-2.png"
            alt="Autarkie Jetzt"
            width={1693}
            height={929}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Hero grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-start">

          {/* Left: Copy */}
          <div className="flex flex-col gap-6 lg:pt-6">

            {/* Trust badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                <span aria-hidden="true">✦</span>
                <span>Detaillierte Analyse · 100% kostenlos</span>
              </span>
            </div>

            {/* H1 */}
            <h1
              className="text-brand-text leading-[1.1] tracking-tight font-heading"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800 }}
            >
              Dein persönlicher<br className="hidden sm:block" /> Solar-Check
            </h1>

            {/* Subheadline */}
            <p className="text-brand-text-muted text-lg leading-relaxed max-w-xl">
              In 3 Minuten erfährst du, ob und wie viel du mit einer Solaranlage sparen kannst – plus kostenlose Beratung von einem Experten.
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-5">
              {[
                { Icon: Check,      label: "Kostenlos"           },
                { Icon: Shield,     label: "Unverbindlich"       },
                { Icon: FileSearch, label: "Detaillierte Analyse" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-brand-text-muted">
                  <Icon
                    className="w-4 h-4 text-brand-primary flex-shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Mobile CTA – scrolls to form */}
            <div className="lg:hidden pt-1">
              <a
                href="#solar-check-form"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-brand-primary text-white rounded-xl font-medium text-base hover:bg-brand-primary-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Solar-Check starten →
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div id="solar-check-form">
            <SolarCheckForm />
          </div>

        </div>
      </div>
    </section>
  );
}
