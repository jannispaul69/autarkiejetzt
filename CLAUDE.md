# Autarkie Jetzt – Lead Generation Landing Page

## 1. Projekt-Übersicht

**Was:** Lead-Generation-Landingpage für Photovoltaik-Anfragen in der Region Bremen (zunächst), später deutschlandweit skalierbar.

**Wer:** Endkunden sind Hausbesitzer 35–65 Jahre, die ihre Energiekosten senken und unabhängiger vom Stromanbieter werden wollen. Käufer der Leads ist eine Solar-Installateur-Firma in Bremen (Testkunde, € 50/Lead).

**Warum:** Aufbau einer Lead-Vermittlungs-Plattform. Diese Landingpage ist der erste Funnel. Weitere Funnels (smartheizen.com für Wärmepumpe, solarberatungsportal.de) folgen.

**Ziel der Seite:** Maximale Conversion-Rate auf das Multistep-Formular. Lead-Qualifizierung über die Formular-Steps. Vertrauen aufbauen ohne klinisch zu wirken.

**Domain:** autarkiejetzt.de  
**Hosting:** Vercel (Free-Tier für Start)  
**Repository:** monorepo mit weiteren Landingpages später möglich

---

## 2. Tech-Stack

| Layer | Technologie | Version | Begründung |
|---|---|---|---|
| Framework | Next.js | 15.x (App Router) | API-Routes für Form + Conversion API, gute Performance |
| Sprache | TypeScript | 5.x | Type-Safety, bessere DX mit Claude Code |
| Styling | Tailwind CSS | 4.x | Schnelles Prototyping, konsistentes Design |
| UI-Components | shadcn/ui | latest | Hochwertige Basis-Komponenten, voll customizable |
| Database | Supabase | latest | Lead-Storage, Form-Events, Auth später für B2B-Portal |
| E-Mail | Resend | latest | Lead-Forwarding an Käufer, Bestätigungsmail an Lead |
| Forms | React Hook Form + Zod | latest | Validierung, Type-Safety |
| Animation | Framer Motion | 11.x | Smooth Step-Transitions im Multistep-Form |
| Tracking | Meta Pixel + Conversion API | – | Client- und Server-side Conversion-Tracking |
| Hosting | Vercel | – | Edge Network, Free SSL, Auto-Deploys |

**Wichtig:**  
- Server Components als Default. Client Components nur wo nötig (Multistep-Form, Tracking).
- API-Routes für alle Backend-Interaktionen (`/api/lead`, `/api/event`, `/api/meta-conversion`).
- Keine Environment-Secrets im Client-Code.

---

## 3. Brand-Identität

### Farbpalette

```css
:root {
  --brand-primary: #0A4D3C;       /* Dunkelgrün – Vertrauen, Erde */
  --brand-primary-hover: #0D5E4A;
  --brand-accent: #F4B400;         /* Sonnen-Gelb – Optimismus */
  --brand-accent-hover: #E0A600;
  --brand-background: #FAFAF7;     /* Warmes Weiß */
  --brand-surface: #FFFFFF;
  --brand-text: #1A1A1A;
  --brand-text-muted: #5C5C5C;
  --brand-border: #E8E5DE;
  --brand-success: #16A34A;
  --brand-error: #DC2626;
}
```

### Typografie

- **Headlines:** Manrope (Google Fonts), Weight 700–800 → CSS-Variable `--font-manrope`
- **Body:** Inter (Google Fonts), Weight 400–500 → CSS-Variable `--font-inter`
- **Größen:**
  - H1: `clamp(2.25rem, 5vw, 3.75rem)` – bold
  - H2: `clamp(1.75rem, 4vw, 2.5rem)` – bold
  - H3: `1.5rem` – semibold
  - Body: `1.0625rem` (17px) – regular, line-height 1.6
  - Small: `0.875rem`

### Tonalität (Copy)

- **Du-Form** in der gesamten Customer-Communication
- Kraftvoll, ehrlich, anpackend
- Konkrete Zahlen statt Marketing-Sprech
- Keine Anglizismen ("Beratung" statt "Consulting", "Anfrage" statt "Lead")
- Aktive Sprache ("So sparst du..." statt "Sparpotenzial ergibt sich...")

### Logo

Vorerst Wortmarke: **Autarkie Jetzt** in Manrope ExtraBold, Primary-Farbe. SVG unter `/public/logo.svg`.

---

## 4. Seitenstruktur

Single-Page-Landingpage mit folgenden Sektionen, in dieser Reihenfolge:

1. **Hero** – Headline, Subheadline, Trust-Microcopy, MultiStepForm eingebettet
2. **Wie es funktioniert** – 3 Steps mit Icon + Beschreibung
3. **Vorteile** – Cards-Grid 2×3
4. **Trust** – Geprüfte Fachbetriebe, DSGVO, Stats, Bewertungs-Badge
5. **FAQ** – Accordion, 6 Fragen
6. **Final CTA** – Wiederholung Formular-Start
7. **Footer** – Logo, Rechtliches, Kontakt

---

## 5. Multistep-Formular

- **Komponente:** `components/form/MultiStepForm.tsx` (Client Component)
- **State Management:** React Hook Form + Zod-Schemas pro Step (in `lib/validation/schemas.ts`)
- **Progress-Bar:** `components/form/FormProgress.tsx`
- **Animation:** Framer Motion `AnimatePresence` für Step-Transitions
- **Persistence:** localStorage, damit Refresh keinen Verlust bedeutet
- **Drop-off-Tracking:** Bei jedem Step-Beginn ein `form_event` an `/api/event`
- **Honeypot:** Verstecktes `_honeypot`-Feld im Formular

### Steps
1. `Step1Housing` – Wohnsituation (owner_house / owner_apartment / renter)
2. `Step2Consumption` – Jahresstromverbrauch
3. `Step3Roof` – Dachausrichtung
4. `Step4Timeframe` – Zeithorizont
5. `Step5Location` – PLZ + Ort
6. `Step6Contact` – Kontaktdaten + 3 Pflicht-Checkboxen

### Disqualifikation
Mieter → `DisqualifiedScreen.tsx`

---

## 6. API-Routes

| Route | Zweck |
|---|---|
| `POST /api/lead` | Form-Submit → Supabase + Resend + Meta Conversion API |
| `POST /api/event` | Form-Events (Drop-off-Tracking) |
| `POST /api/meta-conversion` | Server-side Conversion-Events |

---

## 7. File-Struktur

```
autarkie-jetzt/
├── app/
│   ├── layout.tsx                  # Root layout, Fonts, Pixel-Script
│   ├── page.tsx                    # Landingpage (Server Component)
│   ├── danke/page.tsx              # Conversion-Page (Lead-Event)
│   ├── impressum/page.tsx
│   ├── datenschutz/page.tsx
│   ├── agb/page.tsx
│   ├── globals.css                 # Tailwind + Brand-CSS-Vars
│   └── api/
│       ├── lead/route.ts
│       ├── event/route.ts
│       └── meta-conversion/route.ts
├── components/
│   ├── ui/                         # shadcn
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── Trust.tsx
│   │   ├── FAQ.tsx
│   │   ├── FinalCTA.tsx
│   │   └── Footer.tsx
│   └── form/
│       ├── MultiStepForm.tsx
│       ├── FormProgress.tsx
│       ├── DisqualifiedScreen.tsx
│       └── steps/
│           ├── Step1Housing.tsx
│           ├── Step2Consumption.tsx
│           ├── Step3Roof.tsx
│           ├── Step4Timeframe.tsx
│           ├── Step5Location.tsx
│           └── Step6Contact.tsx
├── lib/
│   ├── supabase/client.ts          # Browser-Client
│   ├── supabase/server.ts          # Server-Client mit Service-Key
│   ├── meta/pixel.ts               # Client-side fbq helpers
│   ├── meta/conversion-api.ts      # Server-side, SHA-256 hashing
│   ├── validation/schemas.ts       # Zod-Schemas (step1–step6 + leadSchema)
│   ├── email/resend.ts             # Lead-Notification-Template
│   └── utils.ts                    # cn(), etc.
├── public/
│   ├── logo.svg
│   └── hero.jpg                    # Platzhalter
├── .env.local.example
├── CLAUDE.md                       # Diese Datei
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 8. Environment-Variablen

Siehe `.env.local.example`. Nie Secrets in Client-Code — alles, was `NEXT_PUBLIC_` fehlt, ist nur serverseitig zugänglich.

---

## 9. Wichtige Regeln

- **Mobile First.** Mehr als 70 % des Traffics kommt von Meta Ads auf Mobile.
- **Server Components als Default.** Nur Client wo nötig (Form, Tracking, Animationen).
- **A11y.** Alle Form-Inputs mit Labels, Fokus-States sichtbar, Tastatur-Navigation.
- **Validierung doppelt.** Client-side mit Zod für UX, Server-side im API-Route.
- **Honeypot-Feld** im Form (`_honeypot`).
- **Kein console.log in Production.** Nur `console.error` bei echten Fehlern.
- **Keine Phantom-Zahlen** außer explizit belegten Facts.
