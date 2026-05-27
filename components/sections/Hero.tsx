import Image from "next/image";
import Link from "next/link";
import { Check, Shield, Clock } from "lucide-react";
import MultiStepForm from "@/components/form/MultiStepForm";

export default function Hero() {
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
            src="/logo.png"
            alt="Autarkie Jetzt"
            width={1693}
            height={929}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Hero grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 lg:items-start">

          {/* Left: Copy */}
          <div className="flex flex-col gap-6 lg:pt-6">

            {/* Trust Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                <span aria-hidden="true">✦</span>
                <span>Bereits über 500 Anfragen vermittelt</span>
              </span>
            </div>

            {/* H1 */}
            <h1
              className="text-brand-text leading-[1.1] tracking-tight font-heading"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800 }}
            >
              Endlich unabhängig<br className="hidden sm:block" /> vom Stromanbieter.
            </h1>

            {/* Subheadline */}
            <p className="text-brand-text-muted text-lg leading-relaxed max-w-xl">
              In 60 Sekunden zur kostenfreien Solar-Beratung von geprüften Fachbetrieben aus deiner Region.
            </p>

            {/* Trust Chips */}
            <div className="flex flex-wrap gap-5">
              {[
                { Icon: Check, label: "Kostenlos" },
                { Icon: Shield, label: "Unverbindlich" },
                { Icon: Clock, label: "Rückmeldung in 24h" },
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
                href="#hero-form"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-brand-primary text-white rounded-xl font-medium text-base hover:bg-brand-primary-hover transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Jetzt Beratung anfragen →
              </a>
            </div>
          </div>

          {/* Right: Hero image (desktop only) + Form */}
          <div className="flex flex-col gap-6">

            {/* Hero image – hidden on mobile */}
            <div className="relative hidden lg:block h-[260px] rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/hero.jpg"
                alt="Haus mit Solaranlage auf dem Dach"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 50vw, 640px"
                priority
              />
            </div>

            {/* Form */}
            <div id="hero-form">
              <MultiStepForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
