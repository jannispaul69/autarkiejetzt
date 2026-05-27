import { STATUS_LABELS } from "@/lib/portal/types";
import type { LeadStatus } from "@/lib/portal/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  appointment: "bg-purple-50 text-purple-700 border-purple-200",
  closed_won: "bg-green-50 text-green-700 border-green-200",
  closed_lost: "bg-red-50 text-red-700 border-red-200",
  reclaimed: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = status as LeadStatus;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        STATUS_STYLES[s] ?? "bg-gray-50 text-gray-500 border-gray-200"
      }`}
    >
      {STATUS_LABELS[s] ?? status}
    </span>
  );
}
