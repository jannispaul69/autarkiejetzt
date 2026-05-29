"use client";

import { useEffect, useState, useTransition } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Check, X, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Settings {
  lead_price_default: string;
  lead_price_grade_a: string;
  lead_price_grade_b: string;
  lead_price_grade_c: string;
  platform_name: string;
  support_email: string;
  reclaim_days: string;
  auto_assign: string;
  auto_marketplace_unmatched: string;
  email_template_lead_notify: string;
  email_template_confirmation: string;
  scoring_weights: string;
}

const DEFAULT_SCORING = {
  roof_south: 25,
  roof_east_west: 18,
  roof_north: 8,
  consumption_over_8000: 25,
  consumption_5000_8000: 22,
  consumption_3000_5000: 15,
  consumption_under_3000: 8,
  timeframe_immediate: 30,
  timeframe_1_3: 22,
  timeframe_3_6: 12,
  timeframe_info: 0,
  location_bonus: 10,
  completeness: 10,
};

// ─── Price card ───────────────────────────────────────────────────────────────

function PriceCard({
  label, sublabel, settingKey, valueCents, onSave,
}: {
  label: string;
  sublabel: string;
  settingKey: string;
  valueCents: string;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [inputEur, setInputEur] = useState((parseInt(valueCents) / 100).toString());
  const [, startTransition] = useTransition();

  function handleSave() {
    const cents = Math.round(parseFloat(inputEur) * 100);
    if (isNaN(cents) || cents < 0) { toast.error("Ungültiger Betrag"); return; }
    startTransition(async () => {
      await onSave(settingKey, String(cents));
      setEditing(false);
      toast.success("Preis gespeichert.");
    });
  }

  const displayEur = (parseInt(valueCents) / 100).toFixed(2);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
      </div>
      {editing ? (
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={inputEur}
              onChange={(e) => setInputEur(e.target.value)}
              className="pl-7 h-9 text-sm"
              autoFocus
            />
          </div>
          <Button size="sm" className="h-9 px-3 bg-[#0A4D3C] hover:bg-[#0D5E4A]" onClick={handleSave}>
            <Check size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="h-9 px-2" onClick={() => setEditing(false)}>
            <X size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">{displayEur} €</p>
          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs gap-1.5 text-gray-500" onClick={() => { setInputEur(displayEur); setEditing(true); }}>
            <Pencil size={12} /> Bearbeiten
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Scoring field ────────────────────────────────────────────────────────────

function ScoringField({
  label, field, value, onChange,
}: { label: string; field: string; value: number; onChange: (f: string, v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={50}
          value={value}
          onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
          className="h-7 w-16 text-sm text-center p-1"
        />
        <span className="text-xs text-gray-400 w-10">Pkt.</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [buyerName, setBuyerName] = useState("Admin");
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [scoring, setScoring] = useState({ ...DEFAULT_SCORING });
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Check auth and load settings
    Promise.all([
      fetch("/api/portal/settings").then((r) => r.json()).catch(() => ({})),
      fetch("/api/portal/me").then((r) => r.json()).catch(() => ({})),
    ]).then(([s, me]) => {
      setSettings(s ?? {});
      if (me?.company_name) setBuyerName(me.company_name);
      try {
        const w = JSON.parse(s?.scoring_weights ?? "{}");
        if (typeof w === "object" && w !== null) setScoring((prev) => ({ ...prev, ...w }));
      } catch {}
      setLoading(false);
    });
  }, []);

  async function saveSetting(key: string, value: string) {
    const res = await fetch("/api/portal/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error("Fehler beim Speichern");
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleGeneralSave(key: keyof Settings) {
    const value = settings[key] ?? "";
    startTransition(async () => {
      try { await saveSetting(key, value); toast.success("Gespeichert."); }
      catch { toast.error("Fehler beim Speichern."); }
    });
  }

  function handleSaveScoring() {
    startTransition(async () => {
      try {
        await saveSetting("scoring_weights", JSON.stringify(scoring));
        toast.success("Scoring-Gewichtungen gespeichert.");
      } catch { toast.error("Fehler beim Speichern."); }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Lädt…
      </div>
    );
  }

  return (
    <PortalShell isAdmin buyerName={buyerName} pageTitle="Einstellungen">
      <div className="max-w-3xl">
        <Tabs defaultValue="prices">
          <TabsList className="mb-6">
            <TabsTrigger value="prices">💰 Preise</TabsTrigger>
            <TabsTrigger value="templates">📧 E-Mail-Vorlagen</TabsTrigger>
            <TabsTrigger value="general">⚙️ Allgemein</TabsTrigger>
            <TabsTrigger value="scoring">📊 Scoring</TabsTrigger>
          </TabsList>

          {/* ── Prices ─────────────────────────────────────────────────────── */}
          <TabsContent value="prices" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PriceCard label="Standard-Preis" sublabel="Alle Leads (Fallback)" settingKey="lead_price_default" valueCents={settings.lead_price_default ?? "5000"} onSave={saveSetting} />
              <PriceCard label="A-Lead Preis" sublabel="Score 80–100" settingKey="lead_price_grade_a" valueCents={settings.lead_price_grade_a ?? "7500"} onSave={saveSetting} />
              <PriceCard label="B-Lead Preis" sublabel="Score 55–79" settingKey="lead_price_grade_b" valueCents={settings.lead_price_grade_b ?? "5000"} onSave={saveSetting} />
              <PriceCard label="C-Lead Preis" sublabel="Score 0–54" settingKey="lead_price_grade_c" valueCents={settings.lead_price_grade_c ?? "2500"} onSave={saveSetting} />
            </div>
            <div className="flex gap-2 items-start bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
              <Info size={15} className="flex-shrink-0 mt-0.5" />
              <p>Individuelle Preise pro Käufer können in der Käufer-Detailseite überschrieben werden.</p>
            </div>
          </TabsContent>

          {/* ── Email templates ─────────────────────────────────────────────── */}
          <TabsContent value="templates" className="space-y-8">
            {[
              {
                title: "Lead-Benachrichtigung (an Käufer)",
                key: "email_template_lead_notify" as keyof Settings,
                vars: ["{{name}}", "{{phone}}", "{{email}}", "{{plz}}", "{{score}}", "{{grade}}", "{{verbrauch}}", "{{dach}}", "{{zeitraum}}"],
              },
              {
                title: "Bestätigungsmail (an Lead)",
                key: "email_template_confirmation" as keyof Settings,
                vars: ["{{first_name}}", "{{plz}}", "{{ort}}"],
              },
            ].map(({ title, key, vars }) => (
              <div key={key} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {vars.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSettings((prev) => ({ ...prev, [key]: (prev[key] ?? "") + v }))}
                      className="px-2 py-0.5 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={settings[key] ?? ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="font-mono text-xs min-h-[200px]"
                  placeholder="Leer lassen = Standard-Template wird verwendet"
                />
                <Button
                  size="sm"
                  className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white"
                  onClick={() => handleGeneralSave(key)}
                >
                  Vorlage speichern
                </Button>
              </div>
            ))}
          </TabsContent>

          {/* ── General ────────────────────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              {[
                { label: "Plattform-Name", key: "platform_name" as keyof Settings },
                { label: "Support E-Mail", key: "support_email" as keyof Settings },
                { label: "Reklamationsfrist (Tage, 1–30)", key: "reclaim_days" as keyof Settings },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs text-gray-600">{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={settings[key] ?? ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGeneralSave(key)}
                    >
                      Speichern
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Auto-Zuweisung</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Neue Leads automatisch dem nächsten passenden Käufer zuweisen (nach PLZ-Match)
                  </p>
                </div>
                <Switch
                  checked={settings.auto_assign === "true"}
                  onCheckedChange={(v) => {
                    const value = String(v);
                    setSettings((prev) => ({ ...prev, auto_assign: value }));
                    startTransition(async () => {
                      try { await saveSetting("auto_assign", value); toast.success("Gespeichert."); }
                      catch { toast.error("Fehler."); }
                    });
                  }}
                />
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Marktplatz: Ungematchte Leads automatisch freigeben
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Neue Leads ohne PLZ-Match werden automatisch im Marktplatz angeboten
                  </p>
                </div>
                <Switch
                  checked={settings.auto_marketplace_unmatched === "true"}
                  onCheckedChange={(v) => {
                    const value = String(v);
                    setSettings((prev) => ({ ...prev, auto_marketplace_unmatched: value }));
                    startTransition(async () => {
                      try {
                        await saveSetting("auto_marketplace_unmatched", value);
                        toast.success("Gespeichert.");
                      } catch { toast.error("Fehler."); }
                    });
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Scoring ────────────────────────────────────────────────────── */}
          <TabsContent value="scoring" className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Scoring-Gewichtungen</h3>
              <div className="grid sm:grid-cols-2 gap-x-8">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Dachausrichtung</p>
                  <ScoringField label="Süd" field="roof_south" value={scoring.roof_south} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="Ost/West" field="roof_east_west" value={scoring.roof_east_west} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="Nord" field="roof_north" value={scoring.roof_north} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Jahresverbrauch</p>
                  <ScoringField label=">8.000 kWh" field="consumption_over_8000" value={scoring.consumption_over_8000} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="5–8 Tsd. kWh" field="consumption_5000_8000" value={scoring.consumption_5000_8000} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="3–5 Tsd. kWh" field="consumption_3000_5000" value={scoring.consumption_3000_5000} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="<3.000 kWh" field="consumption_under_3000" value={scoring.consumption_under_3000} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Zeitraum</p>
                  <ScoringField label="Sofort" field="timeframe_immediate" value={scoring.timeframe_immediate} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="1–3 Monate" field="timeframe_1_3" value={scoring.timeframe_1_3} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="3–6 Monate" field="timeframe_3_6" value={scoring.timeframe_3_6} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="Nur Info" field="timeframe_info" value={scoring.timeframe_info} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sonstiges</p>
                  <ScoringField label="Standort-Bonus" field="location_bonus" value={scoring.location_bonus} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                  <ScoringField label="Vollständigkeit" field="completeness" value={scoring.completeness} onChange={(f, v) => setScoring((p) => ({ ...p, [f]: v }))} />
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Werte werden als Override in der DB gespeichert. Leer = Code-Defaults.
                </p>
                <Button
                  size="sm"
                  className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white"
                  onClick={handleSaveScoring}
                >
                  Gewichtungen speichern
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalShell>
  );
}
