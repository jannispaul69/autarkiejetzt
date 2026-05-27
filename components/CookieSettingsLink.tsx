"use client";

const CONSENT_KEY = "aj_cookie_consent";

export default function CookieSettingsLink() {
  function resetConsent() {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {}
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={resetConsent}
      className="text-sm text-left transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:underline"
      style={{ color: "rgba(255,255,255,0.55)" }}
    >
      Cookie-Einstellungen
    </button>
  );
}
