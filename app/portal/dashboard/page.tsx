import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentBuyer, getBuyerLeads, getBuyerStats } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import ScoreBadge from "@/components/portal/ScoreBadge";
import StatusBadge from "@/components/portal/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, CheckCircle2, Wallet } from "lucide-react";

export const metadata = { title: "Dashboard – Portal" };

export default async function DashboardPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const [stats, leads] = await Promise.all([
    getBuyerStats(buyer.id),
    getBuyerLeads(buyer.id),
  ]);

  const recentLeads = leads.slice(0, 5);
  const balance = (buyer.prepaid_balance / 100).toFixed(2);

  return (
    <PortalShell
      isAdmin={buyer.role === "admin"}
      buyerName={buyer.company_name}
      pageTitle="Dashboard"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Neue Leads (Woche)",
            value: stats.thisWeek,
            icon: Users,
            color: "#0A4D3C",
          },
          {
            label: "Offene Leads",
            value: stats.open,
            icon: TrendingUp,
            color: "#1D4ED8",
          },
          {
            label: "Abschlüsse",
            value: stats.closedWon,
            icon: CheckCircle2,
            color: "#16A34A",
          },
          {
            label: "Guthaben",
            value: `${balance} €`,
            icon: Wallet,
            color: "#D97706",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </CardTitle>
              <stat.icon
                size={18}
                style={{ color: stat.color }}
                aria-hidden
              />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent leads table */}
      <Card className="border shadow-sm">
        <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Letzte Leads
          </CardTitle>
          <Link
            href="/portal/leads"
            className="text-sm font-medium hover:underline"
            style={{ color: "#0A4D3C" }}
          >
            Alle Leads →
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {recentLeads.length === 0 ? (
            <p className="px-6 pb-5 text-sm text-gray-400">
              Noch keine Leads zugewiesen.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">PLZ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Datum</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <Link
                        href={`/portal/leads/${row.lead_id}`}
                        className="hover:underline"
                        style={{ color: "#0A4D3C" }}
                      >
                        {row.leads.first_name} {row.leads.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.leads.postal_code}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge
                        grade={row.leads.quality_grade}
                        score={row.leads.quality_score}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(row.created_at).toLocaleDateString("de-DE")}
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
