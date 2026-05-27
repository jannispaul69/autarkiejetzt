# Autarkie Jetzt

Lead-Generation-Landingpage für Photovoltaik-Anfragen. Gebaut mit Next.js 15, Tailwind CSS v4, shadcn/ui und Supabase.

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- npm

### Setup

1. Repository klonen:
   ```bash
   git clone <repo-url>
   cd autarkie-jetzt
   ```

2. Dependencies installieren:
   ```bash
   npm install
   ```

3. Environment-Variablen anlegen:
   ```bash
   cp .env.local.example .env.local
   ```
   Dann `.env.local` mit echten Werten befüllen (Supabase, Resend, Meta).

4. Entwicklungsserver starten (mit Turbopack):
   ```bash
   npm run dev
   ```

5. Browser öffnen: [http://localhost:3000](http://localhost:3000)

### Verfügbare Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm run dev` | Dev-Server mit Turbopack starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run start` | Produktions-Build starten |
| `npm run lint` | ESLint ausführen |

## Projektstruktur

```
autarkie-jetzt/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root Layout mit Fonts + Metadata
│   ├── page.tsx            # Landingpage (Server Component)
│   ├── danke/              # Danke-Seite nach erfolgreicher Submission
│   ├── impressum/          # Impressum (Platzhalter)
│   ├── datenschutz/        # Datenschutzerklärung (Platzhalter)
│   ├── agb/                # AGB (Platzhalter)
│   └── api/
│       ├── lead/           # POST /api/lead – Form-Submit
│       ├── event/          # POST /api/event – Drop-off-Tracking
│       └── meta-conversion/ # POST /api/meta-conversion – Server-side Pixel
├── components/
│   ├── ui/                 # shadcn/ui Komponenten
│   ├── sections/           # Seitenabschnitte (Hero, FAQ, etc.)
│   └── form/               # MultiStepForm + Steps
├── lib/
│   ├── supabase/           # Supabase Browser- und Server-Client
│   ├── meta/               # Meta Pixel + Conversion API Helpers
│   ├── validation/         # Zod-Schemas für alle Form-Steps
│   └── email/              # Resend E-Mail-Templates
└── public/                 # Statische Assets (logo.svg, hero.jpg)
```

## Supabase-Setup

Im Supabase-Dashboard das SQL aus `CLAUDE.md` → Abschnitt 6 ausführen, um die Tabellen `leads` und `form_events` anzulegen.

## Deployment

1. GitHub-Repo erstellen und pushen
2. In [Vercel](https://vercel.com) importieren
3. Environment-Variablen aus `.env.local.example` in Vercel eintragen
4. Domain `autarkiejetzt.de` in Vercel hinzufügen und DNS-Records setzen

## Sprint-Planung

- **Sprint 1:** Setup ✅ + Hero + MultiStepForm + Submission-Logik
- **Sprint 2:** Restliche Sektionen, Rechtsseiten, Conversion-Tracking
- **Sprint 3:** Polishing, Mobile-Tuning, A11y, Lighthouse ≥ 95
