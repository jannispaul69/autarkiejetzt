-- ============================================================
-- Autarkie Jetzt – Database Schema
-- ============================================================

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Qualifying data
  housing_type        TEXT        NOT NULL CHECK (housing_type IN ('owner_house', 'owner_apartment')),
  annual_consumption  TEXT        NOT NULL,
  roof_orientation    TEXT        NOT NULL,
  timeframe           TEXT        NOT NULL,

  -- Location
  postal_code         TEXT        NOT NULL,
  city                TEXT,

  -- Contact
  first_name          TEXT        NOT NULL,
  last_name           TEXT        NOT NULL,
  phone               TEXT        NOT NULL,
  email               TEXT        NOT NULL,

  -- Consents (always true at insert time, stored for compliance)
  consent_owner_adult  BOOLEAN    NOT NULL DEFAULT true,
  consent_data_sharing BOOLEAN    NOT NULL DEFAULT true,
  consent_privacy      BOOLEAN    NOT NULL DEFAULT true,

  -- Attribution
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  utm_content         TEXT,
  utm_term            TEXT,
  fbclid              TEXT,
  fbp                 TEXT,
  fbc                 TEXT,
  referrer            TEXT,
  landing_page        TEXT,
  ip_address          TEXT,
  user_agent          TEXT,

  -- Status workflow
  status              TEXT        NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'contacted', 'qualified', 'sold', 'disqualified')),

  -- AI scoring (computed at insert time)
  quality_score       INTEGER     CHECK (quality_score BETWEEN 0 AND 100),
  quality_grade       TEXT        CHECK (quality_grade IN ('A', 'B', 'C'))
);

-- Form events table (drop-off tracking per step)
CREATE TABLE IF NOT EXISTS form_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id     UUID        REFERENCES leads(id) ON DELETE SET NULL,
  step        INTEGER     NOT NULL,
  event_type  TEXT        NOT NULL,
  metadata    JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS leads_created_at_idx     ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_postal_code_idx    ON leads (postal_code);
CREATE INDEX IF NOT EXISTS leads_status_idx         ON leads (status);
CREATE INDEX IF NOT EXISTS leads_email_idx          ON leads (email);
CREATE INDEX IF NOT EXISTS form_events_lead_id_idx  ON form_events (lead_id);
CREATE INDEX IF NOT EXISTS form_events_step_idx     ON form_events (step);

-- Row Level Security
ALTER TABLE leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_events ENABLE ROW LEVEL SECURITY;

-- Anon can only INSERT (form submissions)
CREATE POLICY "anon_insert_leads"
  ON leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_insert_form_events"
  ON form_events FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users (B2B portal, future) can SELECT
CREATE POLICY "auth_select_leads"
  ON leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_select_form_events"
  ON form_events FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Quality scoring columns (migration for existing installations)
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C'));

-- ============================================================
-- Deletion log table (DSGVO Art. 17 compliance)
-- ============================================================

CREATE TABLE IF NOT EXISTS deletion_log (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  email                TEXT        NOT NULL,
  leads_deleted_count  INTEGER     NOT NULL DEFAULT 0,
  ip_address           INET,
  user_agent           TEXT
);

CREATE INDEX IF NOT EXISTS deletion_log_created_at_idx ON deletion_log (created_at DESC);
CREATE INDEX IF NOT EXISTS deletion_log_email_idx      ON deletion_log (email);

-- Row Level Security — service role only, no anon access
ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;
