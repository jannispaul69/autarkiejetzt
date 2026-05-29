"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Clock,
  Eye,
  Check,
  X,
  BellRing,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ScoreBadge from "./ScoreBadge";
import { updateBuyerMarketplaceNotify } from "@/lib/portal/actions";
import type { Lead, Buyer } from "@/lib/portal/types";

// ─── Label maps ────────────────────────────────────────────────────────────────

const CONSUMPTION_LABELS: Record<string, string> = {
  under_3000: "<3.000 kWh",
  "3000_5000": "3.000–5.000 kWh",
  "5000_8000": "5.000–8.000 kWh",
  over_8000: ">8.000 kWh",
  unknown: "Nicht angegeben",
};

const ROOF_LABELS: Record<string, string> = {
  south: "Süd / Südost / Südwest",
  east_west: "Ost-West",
  north: "Nord",
  unknown: "Nicht angegeben",
};

const TIMEFRAME_LABELS: Record<string, string> = {
  immediate: "Sofort",
  "1_3_months": "1–3 Monate",
  "3_6_months": "3–6 Monate",
  info_only: "Erst informieren",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function getLeadPrice(
  lead: Lead,
  settings: Record<string, string>,
  buyer: Buyer
): number {
  if (lead.marketplace_price) return lead.marketplace_price;
  if (buyer.custom_lead_price) return buyer.custom_lead_price;
  const grade = lead.quality_grade;
  if (grade === "A") return parseInt(settings.lead_price_grade_a ?? "7500");
  if (grade === "B") return parseInt(settings.lead_price_grade_b ?? "5000");
  return parseInt(settings.lead_price_grade_c ?? "2500");
}

function anonymizePlz(postal_code: string): string {
  return postal_code.slice(0, 2) + "xxx";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `vor ${mins} Minute${mins === 1 ? "" : "n"}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Stunde${hrs === 1 ? "" : "n"}`;
  const days = Math.floor(hrs / 24);
  return `vor ${days} Tag${days === 1 ? "" : "en"}`;
}

/** Stable fake viewer count derived from lead ID chars */
function viewerCount(leadId: string): number {
  const hash = leadId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 3) + 1;
}

function isPhoneVerified(lead: Lead): boolean {
  return lead.landing_page !== "jetzt" && lead.landing_page !== "meta-lead-ad";
}

// ─── Components ───────────────────────────────────────────────────────────────

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
          <Check size={10} strokeWidth={2.5} />
        </span>
      ) : (
        <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          ○
        </span>
      )}
      <span className={ok ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </div>
  );
}

// ─── Post-purchase revealed card ───────────────────────────────────────────────

function PurchasedCard({ lead }: { lead: Lead }) {
  const phoneClean = lead.phone.replace(/\s+/g, "");
  return (
    <div className="rounded-xl border-2 border-green-300 bg-green-50 p-5 flex flex-col gap-4 animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">
          {lead.first_name} {lead.last_name}
        </p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
          <Check size={10} />
          Gekauft
        </span>
      </div>

      {/* Phone — big and prominent */}
      <a
        href={`tel:${phoneClean}`}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-green-200 hover:bg-green-50 transition-colors"
      >
        <Phone size={18} style={{ color: "#0A4D3C" }} />
        <span className="font-bold text-lg" style={{ color: "#0A4D3C" }}>
          {lead.phone}
        </span>
      </a>

      {/* Other contact info */}
      <div className="space-y-1.5 text-sm">
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Mail size={13} className="text-gray-400 flex-shrink-0" />
            {lead.email}
          </a>
        )}
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span>
            {lead.street && <span className="block">{lead.street}</span>}
            {lead.postal_code} {lead.city ?? ""}
          </span>
        </div>
      </div>

      <Link
        href={`/portal/leads/${lead.id}`}
        className="text-center text-xs font-medium py-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors"
        style={{ color: "#0A4D3C" }}
      >
        Zum Lead-Detail →
      </Link>
    </div>
  );
}

// ─── Anonymous lead card ──────────────────────────────────────────────────────

interface CardProps {
  lead: Lead;
  price: number;
  onBuy: () => void;
}

function LeadCard({ lead, price, onBuy }: CardProps) {
  const viewers = viewerCount(lead.id);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Top row: score + price */}
      <div className="flex items-center justify-between">
        <ScoreBadge grade={lead.quality_grade} score={lead.quality_score} />
        <span className="text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
          {formatCents(price)}
        </span>
      </div>

      {/* PLZ area */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <MapPin size={13} className="text-gray-400 flex-shrink-0" />
        <span>
          PLZ-Bereich: <span className="font-semibold">{anonymizePlz(lead.postal_code)}</span>
        </span>
      </div>

      {/* Data checklist */}
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <CheckRow
          ok={lead.annual_consumption !== "unknown"}
          label={`Stromverbrauch: ${CONSUMPTION_LABELS[lead.annual_consumption] ?? lead.annual_consumption}`}
        />
        <CheckRow
          ok={lead.roof_orientation !== "unknown"}
          label={`Dach: ${ROOF_LABELS[lead.roof_orientation] ?? lead.roof_orientation}`}
        />
        <CheckRow
          ok
          label={`Zeitraum: ${TIMEFRAME_LABELS[lead.timeframe] ?? lead.timeframe}`}
        />
        <CheckRow ok={!!lead.street} label="Straße angegeben" />
        <CheckRow ok={!!lead.email} label="E-Mail vorhanden" />
        <CheckRow ok={isPhoneVerified(lead)} label="Telefon verifiziert" />
      </div>

      {/* Masked contact data */}
      <div className="space-y-1 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Phone size={11} />
          <span className="tracking-widest">●●●●●● ●●●●</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Mail size={11} />
          <span className="tracking-widest">●●●●●●@●●●●●●.de</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin size={11} />
          <span className="tracking-widest">●●●●●●● ●●●</span>
        </div>
      </div>

      {/* Time + urgency */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>Eingegangen {timeAgo(lead.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={11} />
          <span>{viewers} {viewers === 1 ? "Käufer schaut" : "Käufer schauen"}</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onBuy}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D3C]"
        style={{ backgroundColor: "#0A4D3C" }}
      >
        Jetzt kaufen für {formatCents(price)} →
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  buyer,
  onToggleNotify,
}: {
  buyer: Buyer;
  onToggleNotify: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [notifyOn, setNotifyOn] = useState(buyer.notify_marketplace ?? false);

  function handleToggle() {
    const next = !notifyOn;
    setNotifyOn(next);
    startTransition(async () => {
      try {
        await updateBuyerMarketplaceNotify(buyer.id, next);
        toast.success(
          next
            ? "Du wirst benachrichtigt wenn neue Leads verfügbar sind."
            : "Benachrichtigungen deaktiviert."
        );
        onToggleNotify(next);
      } catch {
        setNotifyOn(!next);
        toast.error("Fehler beim Speichern.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingCart size={28} className="text-gray-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700">
          Aktuell keine Leads im Marktplatz
        </p>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Neue Leads erscheinen hier sobald sie verfügbar sind.
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          notifyOn
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        <BellRing size={15} />
        {notifyOn
          ? "Benachrichtigung aktiv ✓"
          : "Benachrichtigung bei neuem Lead"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  leads: Lead[];
  buyer: Buyer;
  settings: Record<string, string>;
}

type PurchasedEntry = { leadId: string; fullLead: Lead; newBalance: number };

export default function MarketplaceGrid({ leads, buyer, settings }: Props) {
  const [balance, setBalance] = useState(buyer.prepaid_balance);
  const [purchased, setPurchased] = useState<PurchasedEntry[]>([]);
  const [confirmLead, setConfirmLead] = useState<Lead | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  // Filters
  const [gradeFilter, setGradeFilter] = useState("all");
  const [plzPrefix, setPlzPrefix] = useState("");
  const [maxPrice, setMaxPrice] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const purchasedIds = new Set(purchased.map((p) => p.leadId));

  // Compute prices once per render
  const leadsWithPrice = leads.map((l) => ({
    lead: l,
    price: getLeadPrice(l, settings, buyer),
  }));

  // Filter + sort
  const visible = leadsWithPrice
    .filter(({ lead, price }) => {
      if (purchasedIds.has(lead.id)) return true; // purchased cards always stay visible
      if (gradeFilter !== "all" && lead.quality_grade !== gradeFilter) return false;
      if (plzPrefix && !lead.postal_code.startsWith(plzPrefix)) return false;
      if (maxPrice !== "all" && price > parseInt(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.lead.created_at).getTime() - new Date(a.lead.created_at).getTime();
      }
      if (sortBy === "score") {
        return (b.lead.quality_score ?? 0) - (a.lead.quality_score ?? 0);
      }
      if (sortBy === "cheapest") {
        return a.price - b.price;
      }
      return 0;
    });

  const availableCount = leads.filter((l) => !purchasedIds.has(l.id)).length;
  const confirmPrice = confirmLead
    ? getLeadPrice(confirmLead, settings, buyer)
    : 0;

  async function handleConfirmPurchase() {
    if (!confirmLead) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/portal/purchase-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: confirmLead.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "insufficient_balance") {
          setConfirmLead(null);
          setShowInsufficientBalance(true);
          return;
        }
        toast.error(data.error ?? "Kauf fehlgeschlagen.");
        return;
      }

      setPurchased((prev) => [
        ...prev,
        {
          leadId: confirmLead.id,
          fullLead: data.lead,
          newBalance: data.new_balance,
        },
      ]);
      setBalance(data.new_balance);
      setConfirmLead(null);

      toast.success(
        <span>
          Lead gekauft! Ruf jetzt an:{" "}
          <a
            href={`tel:${data.lead.phone.replace(/\s+/g, "")}`}
            className="font-bold underline"
          >
            {data.lead.phone}
          </a>
        </span>
      );
    } catch {
      toast.error("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            Verfügbare Leads außerhalb deines Stammgebiets. Nach Kauf sofort
            erreichbar.
          </p>
        </div>
        <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm">
          <span className="text-gray-500">Guthaben: </span>
          <span className="font-semibold text-gray-900">{formatCents(balance)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={gradeFilter} onValueChange={(v) => v && setGradeFilter(v)}>
          <SelectTrigger className="h-8 text-xs w-32">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Scores</SelectItem>
            {["A", "B", "C"].map((g) => (
              <SelectItem key={g} value={g}>
                Grade {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={plzPrefix}
            onChange={(e) =>
              setPlzPrefix(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            placeholder="PLZ-Präfix"
            className="h-8 text-xs pl-7 w-28"
          />
        </div>

        <Select value={maxPrice} onValueChange={(v) => v && setMaxPrice(v)}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Max. Preis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Beliebiger Preis</SelectItem>
            <SelectItem value="2500">Bis 25,00 €</SelectItem>
            <SelectItem value="5000">Bis 50,00 €</SelectItem>
            <SelectItem value="7500">Bis 75,00 €</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue placeholder="Sortierung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Neueste zuerst</SelectItem>
            <SelectItem value="score">Bester Score</SelectItem>
            <SelectItem value="cheapest">Günstigste</SelectItem>
          </SelectContent>
        </Select>

        {availableCount > 0 && (
          <span className="ml-auto text-xs text-gray-400">
            {availableCount} Lead{availableCount !== 1 ? "s" : ""} verfügbar
          </span>
        )}
      </div>

      {/* Grid */}
      {leads.length === 0 ? (
        <EmptyState buyer={buyer} onToggleNotify={() => {}} />
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          Keine Leads für diese Filter.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map(({ lead, price }) => {
            const purchasedEntry = purchased.find((p) => p.leadId === lead.id);
            if (purchasedEntry) {
              return <PurchasedCard key={lead.id} lead={purchasedEntry.fullLead} />;
            }
            return (
              <LeadCard
                key={lead.id}
                lead={lead}
                price={price}
                onBuy={() => setConfirmLead(lead)}
              />
            );
          })}
        </div>
      )}

      {/* ── Confirmation modal ────────────────────────────────────────────── */}
      <Dialog open={!!confirmLead} onOpenChange={(o) => !o && setConfirmLead(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lead kaufen</DialogTitle>
          </DialogHeader>

          {confirmLead && (
            <div className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Score</dt>
                  <dd>
                    <ScoreBadge
                      grade={confirmLead.quality_grade}
                      score={confirmLead.quality_score}
                    />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">PLZ-Bereich</dt>
                  <dd className="font-medium">{anonymizePlz(confirmLead.postal_code)}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <dt className="text-gray-500">Preis</dt>
                  <dd className="font-semibold text-gray-900">{formatCents(confirmPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Guthaben danach</dt>
                  <dd
                    className={`font-semibold ${
                      balance - confirmPrice < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {formatCents(balance - confirmPrice)}
                  </dd>
                </div>
              </dl>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmLead(null)}
                  disabled={purchasing}
                >
                  Abbrechen
                </Button>
                <Button
                  className="flex-1 bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white"
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? "Kaufe…" : "Kaufen & Kontaktdaten erhalten"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Insufficient balance modal ────────────────────────────────────── */}
      <Dialog
        open={showInsufficientBalance}
        onOpenChange={(o) => !o && setShowInsufficientBalance(false)}
      >
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <X size={20} className="text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Guthaben nicht ausreichend</p>
              <p className="text-sm text-gray-500 mt-1">
                Dein aktuelles Guthaben reicht nicht aus. Bitte lade dein
                Guthaben auf, um diesen Lead zu kaufen.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Aktuelles Guthaben:{" "}
              <span className="font-semibold text-gray-900">{formatCents(balance)}</span>
            </div>
            <p className="text-xs text-gray-400">
              Wende dich an deinen Admin, um Guthaben aufzuladen.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowInsufficientBalance(false)}
              className="w-full"
            >
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
