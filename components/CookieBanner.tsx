"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

type Consent = "all" | "essential" | null;
const CONSENT_KEY = "aj_cookie_consent";

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY) as Consent;
      if (stored === "all" || stored === "essential") {
        setConsent(stored);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, "all");
    } catch {}
    setConsent("all");
    setVisible(false);
  }

  function handleDecline() {
    try {
      localStorage.setItem(CONSENT_KEY, "essential");
    } catch {}
    setConsent("essential");
    setVisible(false);
  }

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {/* Meta Pixel — only when consent granted */}
      {consent === "all" && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${pixelId}');
          fbq('track','PageView');
        `}</Script>
      )}

      {/* Banner */}
      {visible && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie-Einstellungen"
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {/* Text */}
              <p className="text-sm text-brand-text-muted leading-relaxed flex-1">
                Wir nutzen Cookies und{" "}
                <strong className="text-brand-text font-medium">
                  Meta Pixel
                </strong>{" "}
                zur Optimierung unserer Werbeanzeigen. Technisch
                notwendige Funktionen sind immer aktiv.{" "}
                <Link
                  href="/datenschutz"
                  className="text-brand-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none"
                >
                  Mehr erfahren
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleDecline}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-brand-border bg-white text-sm font-medium text-brand-text hover:bg-brand-background transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                >
                  Nur notwendige
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  style={{ backgroundColor: "#0A4D3C" }}
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
