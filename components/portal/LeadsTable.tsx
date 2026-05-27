"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { updateAssignmentStatus, bulkUpdateAssignmentStatus } from "@/lib/portal/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ScoreBadge from "./ScoreBadge";
import SourceBadge from "./SourceBadge";
import { STATUS_LABELS } from "@/lib/portal/types";
import type { AssignedLead, LeadStatus } from "@/lib/portal/types";
import { toast } from "sonner";
import { Download, Search, CheckSquare } from "lucide-react";

const GRADE_FILTER = ["Alle", "A", "B", "C"] as const;
const STATUS_FILTER = [
  { value: "all", label: "Alle Status" },
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "appointment", label: "Termin" },
  { value: "closed_won", label: "Abschluss" },
  { value: "closed_lost", label: "Kein Abschluss" },
  { value: "reclaimed", label: "Reklamiert" },
] as const;

const CONSUMPTION_LABELS: Record<string, string> = {
  under_3000: "<3.000 kWh",
  "3000_5000": "3–5 Tsd.",
  "5000_8000": "5–8 Tsd.",
  over_8000: ">8.000 kWh",
  unknown: "Unbekannt",
};
const ROOF_LABELS: Record<string, string> = {
  south: "Süd",
  east_west: "Ost/West",
  north: "Nord",
  unknown: "Unbekannt",
};
const TIMEFRAME_LABELS: Record<string, string> = {
  immediate: "Sofort",
  "1_3_months": "1–3 Monate",
  "3_6_months": "3–6 Monate",
  info_only: "Nur Info",
};

interface Props {
  rows: AssignedLead[];
  showBuyer?: boolean;
}

function escapeCSV(v: string | number | null | undefined) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function LeadsTable({ rows, showBuyer = false }: Props) {
  const [gradeFilter, setGradeFilter] = useState("Alle");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const matchGrade = gradeFilter === "Alle" || r.leads.quality_grade === gradeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchSearch =
        !q ||
        `${r.leads.first_name} ${r.leads.last_name}`.toLowerCase().includes(q) ||
        r.leads.postal_code.includes(q) ||
        r.leads.email.toLowerCase().includes(q);
      const rowDate = r.created_at.slice(0, 10);
      const matchFrom = !dateFrom || rowDate >= dateFrom;
      const matchTo = !dateTo || rowDate <= dateTo;
      return matchGrade && matchStatus && matchSearch && matchFrom && matchTo;
    });
  }, [rows, gradeFilter, statusFilter, search, dateFrom, dateTo]);

  // ── Selection ───────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Single status change ─────────────────────────────────────────────────────
  function handleStatusChange(assignmentId: string, newStatus: LeadStatus) {
    startTransition(async () => {
      try {
        await updateAssignmentStatus(assignmentId, newStatus);
        toast.success("Status aktualisiert.");
      } catch {
        toast.error("Fehler beim Speichern.");
      }
    });
  }

  // ── Bulk status change ───────────────────────────────────────────────────────
  function handleBulkStatus(newStatus: LeadStatus) {
    const ids = Array.from(selected);
    if (!ids.length) return;
    startTransition(async () => {
      try {
        await bulkUpdateAssignmentStatus(ids, newStatus);
        toast.success(`${ids.length} Lead${ids.length > 1 ? "s" : ""} aktualisiert.`);
        setSelected(new Set());
      } catch {
        toast.error("Fehler beim Speichern.");
      }
    });
  }

  // ── CSV export ───────────────────────────────────────────────────────────────
  function handleCSVExport() {
    const exportRows = selected.size > 0 ? filtered.filter((r) => selected.has(r.id)) : filtered;
    const headers = [
      "Name", "Telefon", "E-Mail", "PLZ", "Ort",
      "Score", "Grade", "Status", "Eingangsdatum",
      "Dach", "Verbrauch", "Zeitraum",
    ];
    const lines = [
      headers.join(","),
      ...exportRows.map((r) =>
        [
          escapeCSV(`${r.leads.first_name} ${r.leads.last_name}`),
          escapeCSV(r.leads.phone),
          escapeCSV(r.leads.email),
          escapeCSV(r.leads.postal_code),
          escapeCSV(r.leads.city),
          escapeCSV(r.leads.quality_score),
          escapeCSV(r.leads.quality_grade),
          escapeCSV(STATUS_LABELS[r.status] ?? r.status),
          escapeCSV(new Date(r.created_at).toLocaleDateString("de-DE")),
          escapeCSV(ROOF_LABELS[r.leads.roof_orientation] ?? r.leads.roof_orientation),
          escapeCSV(CONSUMPTION_LABELS[r.leads.annual_consumption] ?? r.leads.annual_consumption),
          escapeCSV(TIMEFRAME_LABELS[r.leads.timeframe] ?? r.leads.timeframe),
        ].join(",")
      ),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${exportRows.length} Leads exportiert.`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Grade filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {GRADE_FILTER.map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                gradeFilter === g
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {g === "Alle" ? "Alle Grades" : `Grade ${g}`}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-8 text-xs w-36"
          title="Von"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-8 text-xs w-36"
          title="Bis"
        />

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Name, PLZ, E-Mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs pl-7 w-48"
          />
        </div>

        {/* CSV Export */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleCSVExport}
        >
          <Download size={13} />
          CSV
        </Button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg px-4 py-2.5">
          <CheckSquare size={15} className="text-brand-primary flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700">
            {selected.size} ausgewählt
          </span>
          <div className="flex gap-2 ml-2 flex-wrap">
            {[
              { status: "contacted" as LeadStatus, label: "Als kontaktiert markieren" },
              { status: "appointment" as LeadStatus, label: "Als Termin markieren" },
              { status: "reclaimed" as LeadStatus, label: "Reklamieren" },
            ].map(({ status, label }) => (
              <button
                key={status}
                onClick={() => handleBulkStatus(status)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-gray-200 hover:border-gray-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            Auswahl aufheben
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-sm text-gray-400 gap-2">
            <span className="text-3xl">🔍</span>
            Keine Leads gefunden.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 cursor-pointer"
                    title="Alle auswählen"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PLZ</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Score</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Quelle</th>
                {showBuyer && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Käufer</th>
                )}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selected.has(row.id) ? "bg-blue-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/portal/leads/${row.lead_id}`}
                      className="hover:underline"
                      style={{ color: "#0A4D3C" }}
                    >
                      {row.leads.first_name} {row.leads.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-gray-500 tabular-nums">
                    {row.leads.postal_code}
                    {row.leads.city && (
                      <span className="text-gray-400 text-xs"> {row.leads.city}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <ScoreBadge grade={row.leads.quality_grade} score={row.leads.quality_score} />
                  </td>
                  <td className="px-3 py-3">
                    <SourceBadge source={row.leads.landing_page} />
                  </td>
                  {showBuyer && (
                    <td className="px-3 py-3 text-gray-500 text-xs">{row.buyers?.company_name ?? "–"}</td>
                  )}
                  <td className="px-3 py-3">
                    <Select
                      value={row.status}
                      onValueChange={(v) => v && handleStatusChange(row.id, v as LeadStatus)}
                    >
                      <SelectTrigger className="h-7 text-xs w-36 border-0 bg-transparent p-0 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">
                    {new Date(row.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/portal/leads/${row.lead_id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#0A4D3C" }}
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} von {rows.length} Leads
        {selected.size > 0 && ` · ${selected.size} ausgewählt`}
      </p>
    </div>
  );
}
