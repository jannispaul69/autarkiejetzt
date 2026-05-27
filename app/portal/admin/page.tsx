import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentBuyer,
  getAdminStats,
  getDailyLeadsAdmin,
  getUnassignedLeads,
  getRecentAssignments,
} from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import AdminBarChart from "@/components/portal/AdminBarChart";
import ScoreBadge from "@/components/portal/ScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Building2, TrendingUp, Euro, CalendarDays, UserPlus } from "lucide-react";

export const metadata = { title: "Admin-Übersicht – Portal" };

export default async function AdminPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  const [stats, chartData, unassigned, recentActivity] = await Promise.all([
    getAdminStats(),
    getDailyLeadsAdmin(30),
    getUnassignedLeads(),
    getRecentAssignments(10),
  ]);

  const revenueEur = (stats.monthlyRevenue / 100).toFixed(2);

  return (
    <PortalShell isAdmin buyerName={buyer.company_name} pageTitle="Admin-Übersicht">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Leads heute", value: stats.leadsToday, icon: CalendarDays, color: "#0A4D3C" },
          { label: "Leads diese Woche", value: stats.leadsThisWeek, icon: TrendingUp, color: "#1D4ED8" },
          { label: "Leads gesamt", value: stats.leadsTotal, icon: Database, color: "#6B7280" },
          { label: "Aktive Käufer", value: stats.activeBuyers, icon: Building2, color: "#D97706" },
          { label: "Umsatz (Monat)", value: `${revenueEur} €`, icon: Euro, color: "#16A34A" },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-snug">
                {s.label}
              </CardTitle>
              <s.icon size={15} style={{ color: s.color }} aria-hidden />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="border shadow-sm mb-8">
        <CardHeader className="px-6 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Leads pro Tag – letzte 30 Tage
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <AdminBarChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unassigned leads */}
        <Card className="border shadow-sm">
          <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Nicht zugewiesen ({unassigned.length})
            </CardTitle>
            <Link
              href="/portal/admin/leads"
              className="text-xs font-medium hover:underline"
              style={{ color: "#0A4D3C" }}
            >
              Alle Leads →
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {unassigned.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-sm text-gray-400 gap-2 px-6">
                <span className="text-2xl">✅</span>
                Alle Leads sind zugewiesen.
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {unassigned.slice(0, 8).map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-2.5 font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs tabular-nums">
                        {lead.postal_code}
                      </td>
                      <td className="px-3 py-2.5">
                        <ScoreBadge grade={lead.quality_grade} score={lead.quality_score} />
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <Link
                          href={`/portal/admin/leads`}
                          className="text-xs font-medium hover:underline"
                          style={{ color: "#0A4D3C" }}
                        >
                          Zuweisen →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {unassigned.length > 8 && (
              <p className="px-6 py-2 text-xs text-gray-400">
                + {unassigned.length - 8} weitere
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border shadow-sm">
          <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Letzte Aktivitäten
            </CardTitle>
            <UserPlus size={15} className="text-gray-400" />
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-sm text-gray-400 gap-2">
                <span className="text-2xl">📋</span>
                Noch keine Zuweisungen.
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentActivity.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-2.5 font-medium text-gray-900">
                        {a.leads.first_name} {a.leads.last_name}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">
                        → {a.buyers?.company_name ?? "–"}
                      </td>
                      <td className="px-6 py-2.5 text-right text-xs text-gray-400 tabular-nums">
                        {new Date(a.created_at).toLocaleDateString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { href: "/portal/admin/leads", title: "Alle Leads", desc: `${stats.leadsTotal} Leads gesamt` },
          { href: "/portal/admin/buyers", title: "Käufer verwalten", desc: `${stats.activeBuyers} aktive Käufer` },
          { href: "/portal/admin/settings", title: "Einstellungen", desc: "Preise, Vorlagen, Scoring" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
          >
            <p className="font-semibold text-sm text-gray-900 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
