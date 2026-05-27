"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateBuyerBalance, toggleBuyerActive } from "@/lib/portal/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScoreBadge from "@/components/portal/ScoreBadge";
import StatusBadge from "@/components/portal/StatusBadge";
import Link from "next/link";
import { ChevronLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { Buyer, AssignedLead, BuyerTeamMember } from "@/lib/portal/types";

// Client page — fetch data via a lightweight API endpoint
export default function BuyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [data, setData] = useState<{
    buyer: Buyer;
    team: BuyerTeamMember[];
    assignments: AssignedLead[];
  } | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/buyer/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Lädt…
      </div>
    );
  if (!data?.buyer)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Käufer nicht gefunden.
      </div>
    );

  const { buyer, team, assignments } = data;
  const balance = (buyer.prepaid_balance / 100).toFixed(2);

  function handleTopup() {
    const cents = Math.round(parseFloat(addAmount) * 100);
    if (isNaN(cents) || cents <= 0) return;
    startTransition(async () => {
      try {
        await updateBuyerBalance(id, cents);
        toast.success(`${addAmount} € aufgeladen.`);
        router.refresh();
      } catch {
        toast.error("Fehler beim Aufladen.");
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleBuyerActive(id, !buyer.is_active);
        toast.success(buyer.is_active ? "Deaktiviert." : "Aktiviert.");
        router.refresh();
      } catch {
        toast.error("Fehler.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/portal/admin/buyers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Alle Käufer
        </Link>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {buyer.company_name}
                  </h1>
                  <p className="text-sm text-gray-500">{buyer.contact_name}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    buyer.is_active
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {buyer.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <dl className="space-y-2 text-sm">
                {[
                  ["E-Mail", buyer.email],
                  ["Telefon", buyer.phone ?? "–"],
                  ["PLZ-Gebiete", buyer.postal_codes?.join(", ") ?? "Alle"],
                  ["Leads/Woche", String(buyer.lead_budget_per_week)],
                  ["Rolle", buyer.role],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-32 text-xs text-gray-400 uppercase tracking-wide font-medium flex-shrink-0">
                      {k}
                    </dt>
                    <dd className="text-gray-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleActive}
                  className="text-xs"
                >
                  {buyer.is_active ? "Deaktivieren" : "Aktivieren"}
                </Button>
              </div>
            </div>

            {/* Assignments */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-semibold text-sm text-gray-800">
                  Zugewiesene Leads ({assignments.length})
                </p>
              </div>
              {assignments.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">Keine Leads.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {assignments.slice(0, 20).map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-5 py-2.5 font-medium text-gray-900">
                          {a.leads.first_name} {a.leads.last_name}
                        </td>
                        <td className="px-3 py-2.5">
                          <ScoreBadge
                            grade={a.leads.quality_grade}
                            score={a.leads.quality_score}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-5 py-2.5 text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleDateString("de-DE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Team */}
            {team.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-800">
                    Team ({team.length})
                  </p>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {team.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50">
                        <td className="px-5 py-2.5 font-medium text-gray-900">
                          {m.name}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{m.email}</td>
                        <td className="px-5 py-2.5 text-xs text-gray-400">
                          {m.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Balance panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-amber-600" />
              <p className="font-semibold text-sm text-gray-800">Guthaben</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">{balance} €</p>
            <div className="space-y-2">
              <Label htmlFor="topup" className="text-xs text-gray-500">
                Betrag aufladen (€)
              </Label>
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
                <Button
                  size="sm"
                  onClick={handleTopup}
                  style={{ backgroundColor: "#0A4D3C" }}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
