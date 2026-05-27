import Link from "next/link";
import CookieSettingsLink from "@/components/CookieSettingsLink";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#111111" }} aria-label="Seitenfu&szlig;">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">

        {/* Three-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4">
            <span className="font-heading text-white font-bold text-xl">
              ☀️ Autarkie Jetzt
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Wir verbinden Hausbesitzer mit geprüften Solar-Fachbetrieben aus ihrer Region – kostenlos und unverbindlich.
            </p>
            <address className="not-italic text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
              Schwietz Holding UG (haftungsbeschränkt)<br />
              Grambkermoorer Landstr. 22G<br />
              28719 Bremen
            </address>
          </div>

          {/* Col 2: Legal Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Rechtliches
            </p>
            {[
              { label: "Impressum", href: "/impressum" },
              { label: "Datenschutzerklärung", href: "/datenschutz" },
              { label: "AGB", href: "/agb" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {label}
              </Link>
            ))}
            <CookieSettingsLink />
          </div>

          {/* Col 3: Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Kontakt
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Fragen? Schreib uns:
            </p>
            <a
              href="mailto:anfrage@autarkiejetzt.de"
              className="text-sm font-medium transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
              style={{ color: "#F4B400" }}
            >
              anfrage@autarkiejetzt.de
            </a>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.30)" }}
        >
          <p>© {year} Schwietz Holding UG · autarkiejetzt.de</p>
          <p>Alle Beratungen kostenlos &amp; unverbindlich</p>
        </div>
      </div>
    </footer>
  );
}
