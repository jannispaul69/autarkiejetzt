"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Filter,
  Navigation,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";
import ScoreBadge from "./ScoreBadge";
import StatusBadge from "./StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MapLead } from "@/lib/portal/types";

// Dynamic import — Leaflet requires browser APIs, no SSR
const LeadMap = dynamic(() => import("./LeadMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 text-sm text-gray-400">
      Karte wird geladen…
    </div>
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "new",          label: "Neu" },
  { value: "contacted",    label: "Kontaktiert" },
  { value: "appointment",  label: "Termin vereinbart" },
  { value: "closed_won",   label: "Abgeschlossen" },
  { value: "closed_lost",  label: "Verloren" },
];

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function weekStartStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().slice(0, 10);
}

function buildGoogleMapsUrl(leads: MapLead[]): string {
  const addr = (l: MapLead) =>
    l.street
      ? `${l.street}, ${l.postal_code} ${l.city ?? ""}`.trim()
      : `${l.postal_code} ${l.city ?? ""}`.trim();

  const origin = encodeURIComponent(addr(leads[0]));
  const destination = encodeURIComponent(addr(leads[leads.length - 1]));
  const middle = leads.slice(1, -1);
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  if (middle.length) url += `&waypoints=${middle.map((l) => encodeURIComponent(addr(l))).join("|")}`;
  return url;
}

function dotColor(lead: MapLead): string {
  if (lead.is_unassigned) return "#1A1A1A";
  if (lead.status === "appointment" && lead.next_followup) return "#7C3AED";
  if (lead.quality_grade === "A") return "#16A34A";
  if (lead.quality_grade === "B") return "#D97706";
  return "#6B7280";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  leads: MapLead[];
  filtered: MapLead[];
  statusFilter: Set<string>;
  gradeFilter: Set<string>;
  onlyToday: boolean;
  onlyThisWeek: boolean;
  selectedIds: Set<string>;
  buyerFilter: string;
  buyerOptions?: { id: string; name: string }[];
  isAdmin: boolean;
  onStatusToggle: (s: string) => void;
  onGradeToggle: (g: string) => void;
  onTodayToggle: () => void;
  onWeekToggle: () => void;
  onLeadClick: (lead: MapLead) => void;
  onBuyerFilter: (v: string | null) => void;
  onRoute: () => void;
}

function FilterPanel({
  filtered,
  statusFilter,
  gradeFilter,
  onlyToday,
  onlyThisWeek,
  selectedIds,
  buyerFilter,
  buyerOptions,
  isAdmin,
  onStatusToggle,
  onGradeToggle,
  onTodayToggle,
  onWeekToggle,
  onLeadClick,
  onBuyerFilter,
  onRoute,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">
          {isAdmin ? "Alle Leads" : "Meine Leads"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{filtered.length} sichtbar</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Status filters */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Status
          </p>
          <div className="space-y-1.5">
            {STATUS_OPTIONS.map((s) => (
              <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.has(s.value)}
                  onChange={() => onStatusToggle(s.value)}
                  className="rounded accent-[#0A4D3C] w-3.5 h-3.5"
                />
                <span className="text-xs text-gray-700">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Grade filter */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Score
          </p>
          <div className="flex gap-1.5">
            {["A", "B", "C"].map((g) => (
              <button
                key={g}
                onClick={() => onGradeToggle(g)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  gradeFilter.has(g)
                    ? g === "A"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : g === "B"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-gray-200 text-gray-600 border-gray-300"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Date toggles */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Termine
          </p>
          <div className="space-y-1.5">
            <button
              onClick={onTodayToggle}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                onlyToday
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <CalendarDays size={12} className="inline mr-1.5" />
              Termine heute
            </button>
            <button
              onClick={onWeekToggle}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                onlyThisWeek
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <CalendarDays size={12} className="inline mr-1.5" />
              Diese Woche
            </button>
          </div>
        </div>

        {/* Admin: buyer filter */}
        {isAdmin && buyerOptions && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Käufer
            </p>
            <Select value={buyerFilter} onValueChange={onBuyerFilter}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Alle Käufer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Käufer</SelectItem>
                <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                {buyerOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Lead list */}
        <div className="px-2 py-2 space-y-1">
          {filtered.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor(lead) }}
                />
                <span className="text-xs font-medium text-gray-800 truncate flex-1">
                  {lead.display_name}
                </span>
                {lead.quality_grade && (
                  <span className="text-[10px] font-bold text-gray-400">
                    {lead.quality_grade}
                  </span>
                )}
              </div>
              <div className="ml-4.5 mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>{lead.postal_code}</span>
                <span>·</span>
                <span>{STATUS_LABELS[lead.status] ?? lead.status}</span>
              </div>
              {lead.next_followup && (
                <div className="ml-4.5 mt-0.5 text-[11px] text-violet-600 font-medium">
                  📅 {formatDate(lead.next_followup)}
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              Keine Leads für diese Filter.
            </p>
          )}
        </div>
      </div>

      {/* Route button */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={onRoute}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#0A4D3C" }}
        >
          <Navigation size={14} className="inline mr-2" />
          Route planen{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  leads: MapLead[];
  isAdmin?: boolean;
  buyerOptions?: { id: string; name: string }[];
}

export default function LeadMapView({ leads, isAdmin = false, buyerOptions }: Props) {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["new", "contacted", "appointment"])
  );
  const [gradeFilter, setGradeFilter] = useState<Set<string>>(
    new Set(["A", "B", "C"])
  );
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyThisWeek, setOnlyThisWeek] = useState(false);
  const [buyerFilter, setBuyerFilter] = useState("all");

  // Map interaction state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleStatus(s: string) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleGrade(g: string) {
    setGradeFilter((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const today = todayStr();
  const weekStart = weekStartStr();

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      // Admin buyer filter
      if (isAdmin && buyerFilter !== "all") {
        if (buyerFilter === "unassigned" && !lead.is_unassigned) return false;
        if (buyerFilter !== "unassigned" && lead.buyer_name !== buyerOptions?.find((b) => b.id === buyerFilter)?.name) return false;
      }
      // Status
      if (!statusFilter.has(lead.status)) return false;
      // Grade
      if (lead.quality_grade && !gradeFilter.has(lead.quality_grade)) return false;
      // Date filters
      if (onlyToday) {
        if (!lead.next_followup || lead.next_followup.slice(0, 10) !== today) return false;
      } else if (onlyThisWeek) {
        if (!lead.next_followup || lead.next_followup.slice(0, 10) < weekStart) return false;
      }
      return true;
    });
  }, [leads, statusFilter, gradeFilter, onlyToday, onlyThisWeek, buyerFilter, isAdmin, buyerOptions, today, weekStart]);

  function handleLeadClick(lead: MapLead) {
    if (lead.lat && lead.lng) {
      setFlyTo([lead.lat, lead.lng]);
    }
  }

  function handleRoute() {
    const selected = leads.filter((l) => selectedIds.has(l.id));
    if (selected.length < 2) {
      toast.error("Bitte mindestens 2 Leads auswählen.");
      return;
    }
    const url = buildGoogleMapsUrl(selected);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const selectedCount = selectedIds.size;

  const filterPanel = (
    <FilterPanel
      leads={leads}
      filtered={filtered}
      statusFilter={statusFilter}
      gradeFilter={gradeFilter}
      onlyToday={onlyToday}
      onlyThisWeek={onlyThisWeek}
      selectedIds={selectedIds}
      buyerFilter={buyerFilter}
      buyerOptions={buyerOptions}
      isAdmin={isAdmin}
      onStatusToggle={toggleStatus}
      onGradeToggle={toggleGrade}
      onTodayToggle={() => { setOnlyToday((v) => !v); setOnlyThisWeek(false); }}
      onWeekToggle={() => { setOnlyThisWeek((v) => !v); setOnlyToday(false); }}
      onLeadClick={handleLeadClick}
      onBuyerFilter={(v) => v && setBuyerFilter(v)}
      onRoute={handleRoute}
    />
  );

  return (
    // Break out of PortalShell's p-6 to use full height
    <div className="-m-6 flex h-[calc(100vh-57px)] overflow-hidden">
      {/* ── Desktop filter panel ────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
        {filterPanel}
      </aside>

      {/* ── Map area ───────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mobile: drawer toggle */}
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="absolute top-3 left-3 z-[400] lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-700"
        >
          <Filter size={12} />
          Filter
          {drawerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Selected leads counter + route button overlay */}
        {selectedCount >= 1 && (
          <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-700">
              {selectedCount} ausgewählt
            </span>
            <button
              onClick={handleRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-sm"
              style={{ backgroundColor: "#0A4D3C" }}
            >
              <Navigation size={12} />
              Route in Google Maps →
            </button>
          </div>
        )}

        {/* Leaflet map */}
        <LeadMap
          leads={filtered}
          center={flyTo}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="absolute inset-x-0 top-12 bottom-0 z-[450] lg:hidden bg-white border-t border-gray-200 overflow-hidden flex flex-col">
            {filterPanel}
          </div>
        )}
      </div>
    </div>
  );
}
