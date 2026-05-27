import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentBuyer,
  getBuyerLeads,
  getBuyerStats,
  getDailyLeadsForBuyer,
} from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import ScoreBadge from "@/components/portal/ScoreBadge";
import StatusBadge from "@/components/portal/StatusBadge";
import DashboardChart from "@/components/portal/DashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, TrendingUp, CheckCircle2, Wallet,
  BarChart2, Target, Percent,
} from "lucide-react";

export const metadata = { title: "Dashboard – Portal" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

function fmtDate() {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export default async function DashboardPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const [stats, leads, chartData] = await Promise.all([
    getBuyerStats(buyer.id),
    getBuyerLeads(buyer.id),
    getDailyLeadsForBuyer(buyer.id, 14),
  ]);

  const recentLeads = leads.slice(0, 5);
  const balance = buyer.prepaid_balance / 100;
  const balanceStr = balance.toFixed(2);
  const closeRate = stats.total > 0
    ? Math.round((stats.closedWon / stats.total) * 100)
    : 0;

  const balanceColor =
    balance >= 200 ? "#16A34A" : balance >= 50 ? "#D97706" : "#DC2626";

  // Weekly progress
  const weeklyTarget = buyer.lead_budget_per_week;
  const weeklyPct = weeklyTarget > 0
    ? Math.min(100, Math.round((stats.thisWeek / weeklyTarget) * 100))
    : 0;

  return (
    <PortalShell
      isAdmin={buyer.role === "admin"}
      buyerName={buyer.company_name}
      pageTitle="Dashboard"
    >
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {greeting()}, {buyer.contact_name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">{fmtDate()}</p>
      </div>

      {/* Stat cards — row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Neue Leads (Woche)", value: stats.thisWeek, icon: Users, color: "#0A4D3C" },
          { label: "Offene Leads", value: stats.open, icon: TrendingUp, color: "#1D4ED8" },
          { label: "Abschlüsse", value: stats.closedWon, icon: CheckCircle2, color: "#16A34A" },
          { label: "Gesamt", value: stats.total, icon: BarChart2, color: "#6B7280" },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {s.label}
              </CardTitle>
              <s.icon size={16} style={{ color: s.color }} aria-hidden />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stat cards — row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Close rate */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Abschluss-Rate</CardTitle>
            <Percent size={16} className="text-gray-400" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <p className="text-2xl font-bold text-gray-900">{closeRate} %</p>
          </CardContent>
        </Card>

        {/* Balance with color */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Guthaben</CardTitle>
            <Wallet size={16} style={{ color: balanceColor }} />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <p className="text-2xl font-bold" style={{ color: balanceColor }}>
              {balanceStr} €
            </p>
          </CardContent>
        </Card>

        {/* Weekly progress */}
        <Card className="border shadow-sm col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Leads diese Woche
            </CardTitle>
            <Target size={16} className="text-gray-400" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <p className="text-2xl font-bold text-gray-900">
              {stats.thisWeek}
              <span className="text-sm font-normal text-gray-400 ml-1">/ {weeklyTarget}</span>
            </p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${weeklyPct}%`, backgroundColor: "#0A4D3C" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border shadow-sm mb-8">
        <CardHeader className="px-6 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Leads der letzten 14 Tage
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DashboardChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent leads */}
      <Card className="border shadow-sm">
        <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-800">Letzte 5 Leads</CardTitle>
          <Link href="/portal/leads" className="text-sm font-medium hover:underline" style={{ color: "#0A4D3C" }}>
            Alle Leads →
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-sm text-gray-400 gap-2">
              <span className="text-3xl">📭</span>
              Noch keine Leads zugewiesen.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-gray-100 bg-gray-50">
                  {["Name", "Score", "Status", "Datum", ""].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <Link href={`/portal/leads/${row.lead_id}`} className="hover:underline" style={{ color: "#0A4D3C" }}>
                        {row.leads.first_name} {row.leads.last_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <ScoreBadge grade={row.leads.quality_grade} score={row.leads.quality_score} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs tabular-nums">
                      {new Date(row.created_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/portal/leads/${row.lead_id}`} className="text-xs font-medium hover:underline" style={{ color: "#0A4D3C" }}>→</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
