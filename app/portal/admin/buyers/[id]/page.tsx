"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  updateBuyerBalance,
  toggleBuyerActive,
  updateCustomLeadPrice,
  updateBuyerNotifications,
} from "@/lib/portal/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ScoreBadge from "@/components/portal/ScoreBadge";
import StatusBadge from "@/components/portal/StatusBadge";
import Link from "next/link";
import { ChevronLeft, Wallet, Tag, Bell, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import type { Buyer, AssignedLead, BuyerTeamMember } from "@/lib/portal/types";

export default function BuyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [data, setData] = useState<{
    buyer: Buyer;
    team: BuyerTeamMember[];
    assignments: AssignedLead[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [addAmount, setAddAmount] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customPriceEur, setCustomPriceEur] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyImmediate, setNotifyImmediate] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(false);

  useEffect(() => {
    fetch(`/api/portal/buyer/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        const b: Buyer = d.buyer;
        setUseCustomPrice(b.custom_lead_price !== null);
        setCustomPriceEur(b.custom_lead_price !== null ? (b.custom_lead_price / 100).toString() : "");
        setNotifyEmail(b.notification_email ?? "");
        setNotifyImmediate(b.notify_immediately ?? true);
        setNotifyDaily(b.notify_daily_summary ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Lädt…</div>;
  if (!data?.buyer) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Käufer nicht gefunden.</div>;

  const { buyer, team, assignments } = data;
  const balance = (buyer.prepaid_balance / 100).toFixed(2);
  const balanceNum = buyer.prepaid_balance / 100;
  const balanceColor = balanceNum >= 200 ? "#16A34A" : balanceNum >= 50 ? "#D97706" : "#DC2626";

  // Stats
  const closedWon = assignments.filter((a) => a.status === "closed_won").length;
  const closeRate = assignments.length > 0 ? Math.round((closedWon / assignments.length) * 100) : 0;
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = assignments.filter((a) => new Date(a.created_at) >= weekStart).length;
  const thisMonth = assignments.filter((a) => new Date(a.created_at) >= monthStart).length;
  const scores = assignments.map((a) => a.leads?.quality_score).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Revenue from price_paid
  const totalRevenue = assignments.reduce((s, a) => s + (a.price_paid ?? 0), 0);

  function handleTopup() {
    const cents = Math.round(parseFloat(addAmount) * 100);
    if (isNaN(cents) || cents <= 0) return;
    startTransition(async () => {
      try { await updateBuyerBalance(id, cents); toast.success(`${addAmount} € aufgeladen.`); router.refresh(); setAddAmount(""); }
      catch { toast.error("Fehler beim Aufladen."); }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      try { await toggleBuyerActive(id, !buyer.is_active); toast.success(buyer.is_active ? "Deaktiviert." : "Aktiviert."); router.refresh(); }
      catch { toast.error("Fehler."); }
    });
  }

  function handleCustomPrice() {
    if (!useCustomPrice) {
      startTransition(async () => {
        try { await updateCustomLeadPrice(id, null); toast.success("Standard-Preis wird genutzt."); }
        catch { toast.error("Fehler."); }
      });
      return;
    }
    const cents = Math.round(parseFloat(customPriceEur) * 100);
    if (isNaN(cents) || cents < 0) { toast.error("Ungültiger Betrag"); return; }
    startTransition(async () => {
      try { await updateCustomLeadPrice(id, cents); toast.success("Individueller Preis gespeichert."); }
      catch { toast.error("Fehler."); }
    });
  }

  function handleSaveNotifications() {
    startTransition(async () => {
      try {
        await updateBuyerNotifications(id, {
          notification_email: notifyEmail || null,
          notify_immediately: notifyImmediate,
          notify_daily_summary: notifyDaily,
        });
        toast.success("Benachrichtigungen gespeichert.");
      } catch { toast.error("Fehler."); }
    });
  }

  function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon size={15} className="text-gray-400" />
          <p className="font-semibold text-sm text-gray-800">{title}</p>
        </div>
        <div className="p-5">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link href="/portal/admin/buyers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} /> Alle Käufer
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {/* Info card */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{buyer.company_name}</h1>
                  <p className="text-sm text-gray-500">{buyer.contact_name}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${buyer.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {buyer.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <dl className="space-y-2 text-sm">
                {[
                  ["E-Mail", buyer.email],
                  ["Telefon", buyer.phone ?? "–"],
                  ["PLZ-Gebiete", buyer.postal_codes?.join(", ") ?? "Alle"],
                  ["Leads/Woche", String(buyer.lead_budget_per_week)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-32 text-xs text-gray-400 uppercase tracking-wide font-medium flex-shrink-0">{k}</dt>
                    <dd className="text-gray-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={handleToggleActive} className="text-xs">
                  {buyer.is_active ? "Deaktivieren" : "Aktivieren"}
                </Button>
              </div>
            </div>

            {/* Statistics */}
            <Section title="Statistiken" icon={BarChart2}>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Gesamt", value: assignments.length },
                  { label: "Diese Woche", value: thisWeek },
                  { label: "Dieser Monat", value: thisMonth },
                  { label: "Abschlüsse", value: closedWon },
                  { label: "Abschluss-Rate", value: `${closeRate} %` },
                  { label: "Ø Score", value: avgScore !== null ? avgScore : "–" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {totalRevenue > 0 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Umsatz gesamt: <span className="font-semibold text-gray-800">{(totalRevenue / 100).toFixed(2)} €</span>
                </p>
              )}
            </Section>

            {/* Custom price */}
            <Section title="Individueller Lead-Preis" icon={Tag}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Standard-Preis nutzen</p>
                    <p className="text-xs text-gray-400">Aus den globalen Plattform-Einstellungen</p>
                  </div>
                  <Switch
                    checked={!useCustomPrice}
                    onCheckedChange={(v) => setUseCustomPrice(!v)}
                  />
                </div>
                {useCustomPrice && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">Individueller Preis (€)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={customPriceEur}
                        onChange={(e) => setCustomPriceEur(e.target.value)}
                        className="pl-7"
                        placeholder="45.00"
                      />
                    </div>
                  </div>
                )}
                <Button size="sm" className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white" onClick={handleCustomPrice}>
                  Preis speichern
                </Button>
              </div>
            </Section>

            {/* Notifications */}
            <Section title="Benachrichtigungen" icon={Bell}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">
                    Benachrichtigungs-E-Mail{" "}
                    <span className="text-gray-400">(Standard = Login-E-Mail: {buyer.email})</span>
                  </Label>
                  <Input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder={buyer.email}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Sofort bei neuem Lead", sub: "Direkte E-Mail bei jeder Zuweisung", value: notifyImmediate, set: setNotifyImmediate },
                    { label: "Tägliche Zusammenfassung", sub: "Einmal täglich summiert", value: notifyDaily, set: setNotifyDaily },
                  ].map(({ label, sub, value, set }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                      <Switch checked={value} onCheckedChange={set} />
                    </div>
                  ))}
                </div>
                <Button size="sm" className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white" onClick={handleSaveNotifications}>
                  Speichern
                </Button>
              </div>
            </Section>

            {/* Assignments */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-sm text-gray-800">Zugewiesene Leads ({assignments.length})</p>
              </div>
              {assignments.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">Keine Leads.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {assignments.slice(0, 20).map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-2.5 font-medium text-gray-900">{a.leads.first_name} {a.leads.last_name}</td>
                        <td className="px-3 py-2.5"><ScoreBadge grade={a.leads.quality_grade} score={a.leads.quality_score} /></td>
                        <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                        <td className="px-3 py-2.5 text-xs text-gray-400 tabular-nums">{new Date(a.created_at).toLocaleDateString("de-DE")}</td>
                        {a.price_paid && (
                          <td className="px-5 py-2.5 text-xs text-gray-500">{(a.price_paid / 100).toFixed(2)} €</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {assignments.length > 20 && (
                <p className="px-5 py-2 text-xs text-gray-400">+ {assignments.length - 20} weitere</p>
              )}
            </div>

            {/* Team */}
            {team.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-800">Team ({team.length})</p>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {team.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50">
                        <td className="px-5 py-2.5 font-medium text-gray-900">{m.name}</td>
                        <td className="px-3 py-2.5 text-gray-500">{m.email}</td>
                        <td className="px-5 py-2.5 text-xs text-gray-400">{m.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column — balance */}
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={16} style={{ color: balanceColor }} />
                <p className="font-semibold text-sm text-gray-800">Guthaben</p>
              </div>
              <p className="text-3xl font-bold mb-4" style={{ color: balanceColor }}>{balance} €</p>
              <div className="space-y-2">
                <Label htmlFor="topup" className="text-xs text-gray-500">Betrag aufladen (€)</Label>
                <div className="flex gap-2">
                  <Input
                    id="topup"
                    type="number"
                    min={1}
                    step={1}
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="50"
                  />
                  <Button size="sm" onClick={handleTopup} style={{ backgroundColor: "#0A4D3C" }}>+</Button>
                </div>
              </div>
              {/* Quickload buttons */}
              <div className="flex gap-2 mt-3">
                {[50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setAddAmount(String(amt)); }}
                    className="flex-1 text-xs py-1.5 rounded-md border border-gray-200 hover:border-gray-400 transition-colors text-gray-600"
                  >
                    +{amt} €
                  </button>
                ))}
              </div>
              {assignments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Letzte Transaktionen</p>
                  <div className="space-y-1.5">
                    {assignments
                      .filter((a) => a.price_paid)
                      .slice(0, 10)
                      .map((a) => (
                        <div key={a.id} className="flex justify-between text-xs text-gray-500">
                          <span className="truncate mr-2">{a.leads.first_name} {a.leads.last_name}</span>
                          <span className="tabular-nums font-medium text-gray-700 flex-shrink-0">
                            -{(a.price_paid! / 100).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
