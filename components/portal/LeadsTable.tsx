"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateAssignmentStatus } from "@/lib/portal/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ScoreBadge from "./ScoreBadge";
import { STATUS_LABELS } from "@/lib/portal/types";
import type { AssignedLead, LeadStatus } from "@/lib/portal/types";
import { toast } from "sonner";

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

interface Props {
  rows: AssignedLead[];
  showBuyer?: boolean;
}

export default function LeadsTable({ rows, showBuyer = false }: Props) {
  const [gradeFilter, setGradeFilter] = useState<string>("Alle");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, startTransition] = useTransition();

  const filtered = rows.filter((r) => {
    const matchGrade =
      gradeFilter === "Alle" || r.leads.quality_grade === gradeFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchGrade && matchStatus;
  });

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {GRADE_FILTER.map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              gradeFilter === g
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {g === "Alle" ? "Alle Grades" : `Grade ${g}`}
          </button>
        ))}

        <div className="ml-auto">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center">
            Keine Leads gefunden.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  PLZ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Score
                </th>
                {showBuyer && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Käufer
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Datum
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    <Link
                      href={`/portal/leads/${row.lead_id}`}
                      className="hover:underline"
                      style={{ color: "#0A4D3C" }}
                    >
                      {row.leads.first_name} {row.leads.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums">
                    {row.leads.postal_code}
                    {row.leads.city && (
                      <span className="text-gray-400"> {row.leads.city}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge
                      grade={row.leads.quality_grade}
                      score={row.leads.quality_score}
                    />
                  </td>
                  {showBuyer && (
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {row.buyers?.company_name ?? "–"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Select
                      value={row.status}
                      onValueChange={(v) =>
                        v && handleStatusChange(row.id, v as LeadStatus)
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-36 border-0 bg-transparent p-0 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v} className="text-xs">
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs tabular-nums">
                    {new Date(row.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/leads/${row.lead_id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#0A4D3C" }}
                    >
                      Detail →
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
      </p>
    </div>
  );
}
