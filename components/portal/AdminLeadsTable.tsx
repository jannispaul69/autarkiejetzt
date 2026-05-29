"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { assignLeadToBuyer, setLeadMarketplace } from "@/lib/portal/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ScoreBadge from "./ScoreBadge";
import StatusBadge from "./StatusBadge";
import SourceBadge from "./SourceBadge";
import type { Lead } from "@/lib/portal/types";
import { toast } from "sonner";
import { Download, ShoppingCart, Check } from "lucide-react";

interface Row {
  lead: Lead;
  assignment: {
    lead_id: string;
    buyer_id: string;
    status: string;
    buyers?: { id: string; company_name: string } | null;
  } | null;
}

interface Buyer {
  id: string;
  company_name: string;
}

interface Props {
  rows: Row[];
  buyers: Buyer[];
}

/** Per-lead marketplace price override state */
type MarketplaceState = Record<string, { pending: boolean; priceInput: string }>;

export default function AdminLeadsTable({ rows, buyers }: Props) {
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [marketplace, setMarketplace] = useState<MarketplaceState>({});
  const [, startTransition] = useTransition();

  const filtered = rows.filter((r) => {
    const matchGrade =
      gradeFilter === "all" || r.lead.quality_grade === gradeFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "unassigned" && !r.assignment) ||
      r.assignment?.status === statusFilter;
    const matchBuyer =
      buyerFilter === "all" ||
      (buyerFilter === "unassigned" && !r.assignment) ||
      r.assignment?.buyer_id === buyerFilter;
    return matchGrade && matchStatus && matchBuyer;
  });

  function handleAssign(leadId: string, buyerId: string) {
    startTransition(async () => {
      try {
        await assignLeadToBuyer(leadId, buyerId);
        toast.success("Lead zugewiesen.");
      } catch {
        toast.error("Fehler beim Zuweisen.");
      }
    });
  }

  function handleMarketplace(lead: Lead) {
    if (lead.marketplace_available) return; // already in marketplace

    const priceRaw = marketplace[lead.id]?.priceInput ?? "";
    const priceCents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

    setMarketplace((prev) => ({
      ...prev,
      [lead.id]: { ...(prev[lead.id] ?? { priceInput: "" }), pending: true },
    }));

    startTransition(async () => {
      try {
        await setLeadMarketplace(lead.id, true, priceCents);
        toast.success("Lead im Marktplatz verfügbar.");
      } catch {
        toast.error("Fehler beim Freigeben.");
        setMarketplace((prev) => ({
          ...prev,
          [lead.id]: { ...(prev[lead.id] ?? { priceInput: "" }), pending: false },
        }));
      }
    });
  }

  function exportCsv() {
    const header = [
      "Name",
      "PLZ",
      "Stadt",
      "Score",
      "Grade",
      "Status",
      "Käufer",
      "Datum",
    ].join(",");
    const csvRows = filtered.map((r) =>
      [
        `"${r.lead.first_name} ${r.lead.last_name}"`,
        r.lead.postal_code,
        r.lead.city ?? "",
        r.lead.quality_score ?? "",
        r.lead.quality_grade ?? "",
        r.assignment?.status ?? "Nicht zugewiesen",
        `"${r.assignment?.buyers?.company_name ?? "–"}"`,
        new Date(r.lead.created_at).toLocaleDateString("de-DE"),
      ].join(",")
    );
    const blob = new Blob([[header, ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={gradeFilter} onValueChange={(v) => v && setGradeFilter(v)}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Grades</SelectItem>
            {["A", "B", "C"].map((g) => (
              <SelectItem key={g} value={g}>
                Grade {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
            {[
              "new",
              "contacted",
              "appointment",
              "closed_won",
              "closed_lost",
              "reclaimed",
            ].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={buyerFilter} onValueChange={(v) => v && setBuyerFilter(v)}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Käufer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Käufer</SelectItem>
            <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
            {buyers.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={exportCsv}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <Download size={13} />
          CSV Export
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Name",
                "PLZ",
                "Score",
                "Quelle",
                "Status",
                "Käufer",
                "Datum",
                "Zuweisen",
                "Marktplatz",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.lead.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link
                    href={`/portal/leads/${r.lead.id}`}
                    className="hover:underline"
                    style={{ color: "#0A4D3C" }}
                  >
                    {r.lead.first_name} {r.lead.last_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums">
                  {r.lead.postal_code}
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge
                    grade={r.lead.quality_grade}
                    score={r.lead.quality_score}
                  />
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={r.lead.landing_page} />
                </td>
                <td className="px-4 py-3">
                  {r.assignment ? (
                    <StatusBadge status={r.assignment.status} />
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Nicht zugewiesen
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {r.assignment?.buyers?.company_name ?? "–"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">
                  {new Date(r.lead.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={r.assignment?.buyer_id ?? ""}
                    onValueChange={(buyerId) =>
                      buyerId && handleAssign(r.lead.id, buyerId)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-36 border-dashed">
                      <SelectValue placeholder="Zuweisen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  {r.lead.marketplace_available ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                      <Check size={11} />
                      Im Marktplatz
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">€</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          placeholder="Standard"
                          value={marketplace[r.lead.id]?.priceInput ?? ""}
                          onChange={(e) =>
                            setMarketplace((prev) => ({
                              ...prev,
                              [r.lead.id]: {
                                ...(prev[r.lead.id] ?? { pending: false }),
                                priceInput: e.target.value,
                              },
                            }))
                          }
                          className="h-7 w-24 text-xs pl-5 pr-2 border border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <button
                        onClick={() => handleMarketplace(r.lead)}
                        disabled={marketplace[r.lead.id]?.pending}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[#0A4D3C] text-white hover:bg-[#0D5E4A] transition-colors disabled:opacity-50"
                      >
                        <ShoppingCart size={11} />
                        Freigeben
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-sm text-gray-400 text-center">
            Keine Leads gefunden.
          </p>
        )}
      </div>
      <p className="text-xs text-gray-400">
        {filtered.length} von {rows.length} Leads
      </p>
    </div>
  );
}
