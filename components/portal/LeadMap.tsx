"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import Link from "next/link";
import type { MapLead } from "@/lib/portal/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function markerColor(lead: MapLead): string {
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

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  appointment: "Termin vereinbart",
  closed_won: "Abschluss",
  closed_lost: "Verloren",
  reclaimed: "Reklamiert",
  unassigned: "Nicht zugewiesen",
};

const CONSUMPTION_LABELS: Record<string, string> = {
  under_3000: "<3 Tsd. kWh",
  "3000_5000": "3–5 Tsd. kWh",
  "5000_8000": "5–8 Tsd. kWh",
  over_8000: ">8 Tsd. kWh",
  unknown: "–",
};

const ROOF_LABELS: Record<string, string> = {
  south: "Süd/SO/SW",
  east_west: "Ost-West",
  north: "Nord",
  unknown: "–",
};

// ─── FlyToController — responds to external "fly-to" requests ─────────────────

function FlyToController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const prev = useRef<string>("");
  useEffect(() => {
    if (!center) return;
    const key = center.join(",");
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// ─── MarkerPopup ──────────────────────────────────────────────────────────────

function MarkerPopup({
  lead,
  isSelected,
  onToggleSelect,
}: {
  lead: MapLead;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const phoneClean = lead.phone.replace(/\s+/g, "");
  return (
    <div className="text-sm min-w-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          {lead.quality_grade && (
            <span
              className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded mr-1.5"
              style={{
                backgroundColor:
                  lead.quality_grade === "A"
                    ? "#dcfce7"
                    : lead.quality_grade === "B"
                    ? "#fef3c7"
                    : "#f3f4f6",
                color:
                  lead.quality_grade === "A"
                    ? "#166534"
                    : lead.quality_grade === "B"
                    ? "#92400e"
                    : "#4b5563",
              }}
            >
              {lead.quality_grade}-Lead · {lead.quality_score} Pkt.
            </span>
          )}
        </div>
      </div>

      {/* Name + Location */}
      <p className="font-semibold text-gray-900 mb-0.5">{lead.display_name}</p>
      <p className="text-gray-500 text-xs mb-2">
        {lead.postal_code} {lead.city ?? ""}
      </p>

      <hr className="border-gray-100 mb-2" />

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-600 mb-2">
        <div>📞 {lead.phone}</div>
        <div>
          Dach: {ROOF_LABELS[lead.roof_orientation] ?? lead.roof_orientation} ·{" "}
          {CONSUMPTION_LABELS[lead.annual_consumption] ?? lead.annual_consumption}
        </div>
        <div>
          Status:{" "}
          <span className="font-medium">{STATUS_LABELS[lead.status] ?? lead.status}</span>
        </div>
        {lead.next_followup && (
          <div className="font-medium text-violet-700">
            📅 Termin: {formatDate(lead.next_followup)}
          </div>
        )}
        {lead.buyer_name && (
          <div className="text-gray-400">Käufer: {lead.buyer_name}</div>
        )}
      </div>

      <hr className="border-gray-100 mb-2" />

      {/* Route checkbox */}
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(lead.id)}
          className="rounded accent-[#0A4D3C]"
        />
        Für Route auswählen
      </label>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!lead.is_unassigned && (
          <Link
            href={`/portal/leads/${lead.id}`}
            className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
            style={{ color: "#0A4D3C" }}
          >
            CRM öffnen
          </Link>
        )}
        <a
          href={`tel:${phoneClean}`}
          className="flex-1 text-center text-xs py-1.5 rounded-lg text-white font-medium"
          style={{ backgroundColor: "#0A4D3C" }}
        >
          Anrufen
        </a>
      </div>
    </div>
  );
}

// ─── Main LeadMap component ───────────────────────────────────────────────────

interface Props {
  leads: MapLead[];
  center: [number, number] | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [52.5, 9.5]; // Central Germany

export default function LeadMap({ leads, center, selectedIds, onToggleSelect }: Props) {
  // Compute map centre from lead coordinates
  const mapped = leads.filter((l) => l.lat && l.lng);
  const initialCenter: [number, number] =
    mapped.length > 0
      ? [
          mapped.reduce((s, l) => s + l.lat!, 0) / mapped.length,
          mapped.reduce((s, l) => s + l.lng!, 0) / mapped.length,
        ]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToController center={center} />

      {leads
        .filter((l) => l.lat && l.lng)
        .map((lead) => {
          const isSelected = selectedIds.has(lead.id);
          const color = markerColor(lead);
          return (
            <CircleMarker
              key={lead.id}
              center={[lead.lat!, lead.lng!]}
              radius={isSelected ? 16 : 12}
              pathOptions={{
                color: isSelected ? "#ffffff" : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 1.5,
              }}
            >
              <Popup minWidth={240}>
                <MarkerPopup
                  lead={lead}
                  isSelected={isSelected}
                  onToggleSelect={onToggleSelect}
                />
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
}
