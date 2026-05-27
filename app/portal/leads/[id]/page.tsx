import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentBuyer, getAssignmentByLeadId } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import ScoreBadge from "@/components/portal/ScoreBadge";
import CrmPanel from "@/components/portal/CrmPanel";
import { ChevronLeft, Phone, Mail } from "lucide-react";
import SourceBadge from "@/components/portal/SourceBadge";

const HUMAN_LABELS: Record<string, Record<string, string>> = {
  housing_type: {
    owner_house: "Eigentümer (Haus)",
    owner_apartment: "Eigentümer (ETW)",
  },
  annual_consumption: {
    under_3000: "Unter 3.000 kWh",
    "3000_5000": "3.000 – 5.000 kWh",
    "5000_8000": "5.000 – 8.000 kWh",
    over_8000: "Über 8.000 kWh",
    unknown: "Nicht bekannt",
  },
  roof_orientation: {
    south: "Süd / Südost / Südwest",
    east_west: "Ost-West",
    north: "Nord",
    unknown: "Nicht bekannt",
  },
  timeframe: {
    immediate: "So schnell wie möglich",
    "1_3_months": "1–3 Monate",
    "3_6_months": "3–6 Monate",
    info_only: "Erst informieren",
  },
};

function lbl(category: string, key: string) {
  return HUMAN_LABELS[category]?.[key] ?? key;
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide sm:w-36 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-900">{children}</dd>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const row = await getAssignmentByLeadId(id, buyer.id);
  if (!row) notFound();

  const { leads: lead } = row;
  const phoneClean = lead.phone.replace(/\s+/g, "");

  // Score breakdown (re-derive from lead data for display)
  const scoreBreakdown = [
    { label: "Dach", value: lead.roof_orientation },
    { label: "Verbrauch", value: lead.annual_consumption },
    { label: "Zeitraum", value: lead.timeframe },
    { label: "PLZ", value: lead.postal_code },
  ];

  return (
    <PortalShell
      isAdmin={buyer.role === "admin"}
      buyerName={buyer.company_name}
      pageTitle={`${lead.first_name} ${lead.last_name}`}
    >
      {/* Back */}
      <Link
        href="/portal/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Zurück zu Leads
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* ── LEFT: Lead data ──────────────────────────────── */}
        <div className="space-y-6">
          {/* Score card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Lead-Score
              </h2>
              <ScoreBadge
                grade={lead.quality_grade}
                score={lead.quality_score}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {item.label}:
                  </span>{" "}
                  {item.value}
                </div>
              ))}
            </div>
          </div>

          {/* Contact data */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Kontakt
            </h2>
            <dl>
              <DataRow label="Name">
                {lead.first_name} {lead.last_name}
              </DataRow>
              <DataRow label="Telefon">
                <a
                  href={`tel:${phoneClean}`}
                  className="inline-flex items-center gap-1.5 font-bold hover:underline"
                  style={{ color: "#0A4D3C" }}
                >
                  <Phone size={14} />
                  {lead.phone}
                </a>
              </DataRow>
              <DataRow label="E-Mail">
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: "#0A4D3C" }}
                >
                  <Mail size={14} />
                  {lead.email}
                </a>
              </DataRow>
              <DataRow label="Adresse">
                {lead.street && <span className="block">{lead.street}</span>}
                {lead.postal_code} {lead.city ?? ""}
              </DataRow>
              <DataRow label="Quelle">
                <SourceBadge source={lead.landing_page} />
              </DataRow>
              <DataRow label="Eingegangen">
                {new Date(lead.created_at).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </DataRow>
            </dl>
          </div>

          {/* Object data */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Objekt &amp; Interesse
            </h2>
            <dl>
              <DataRow label="Eigentümer">
                {lbl("housing_type", lead.housing_type)}
              </DataRow>
              <DataRow label="Jahresverbrauch">
                {lbl("annual_consumption", lead.annual_consumption)}
              </DataRow>
              <DataRow label="Dachausrichtung">
                {lbl("roof_orientation", lead.roof_orientation)}
              </DataRow>
              <DataRow label="Zeitrahmen">
                {lbl("timeframe", lead.timeframe)}
              </DataRow>
            </dl>
          </div>
        </div>

        {/* ── RIGHT: CRM panel ─────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            CRM
          </h2>
          <CrmPanel assignment={row} leadCreatedAt={lead.created_at} />
        </div>
      </div>
    </PortalShell>
  );
}
