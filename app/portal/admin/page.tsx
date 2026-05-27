import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentBuyer, getAllBuyers, getAllLeadsWithAssignment } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Building2, TrendingUp, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Admin-Übersicht – Portal" };

export default async function AdminPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  const [buyers, leadsData] = await Promise.all([
    getAllBuyers(),
    getAllLeadsWithAssignment(),
  ]);

  const activeBuyers = buyers.filter((b) => b.is_active).length;
  const totalLeads = leadsData.length;
  const assignedLeads = leadsData.filter((l) => l.assignment).length;
  const closedWon = leadsData.filter(
    (l) => l.assignment?.status === "closed_won"
  ).length;

  const stats = [
    {
      label: "Gesamt-Leads",
      value: totalLeads,
      icon: Database,
      href: "/portal/admin/leads",
      color: "#0A4D3C",
    },
    {
      label: "Zugewiesen",
      value: assignedLeads,
      icon: TrendingUp,
      href: "/portal/admin/leads",
      color: "#1D4ED8",
    },
    {
      label: "Abschlüsse",
      value: closedWon,
      icon: CheckCircle2,
      href: "/portal/admin/leads",
      color: "#16A34A",
    },
    {
      label: "Aktive Käufer",
      value: activeBuyers,
      icon: Building2,
      href: "/portal/admin/buyers",
      color: "#D97706",
    },
  ];

  return (
    <PortalShell
      isAdmin
      buyerName={buyer.company_name}
      pageTitle="Admin-Übersicht"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {s.label}
                </CardTitle>
                <s.icon size={18} style={{ color: s.color }} aria-hidden />
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        {[
          {
            href: "/portal/admin/leads",
            title: "Alle Leads",
            desc: `${totalLeads} Leads gesamt, ${totalLeads - assignedLeads} nicht zugewiesen`,
          },
          {
            href: "/portal/admin/buyers",
            title: "Käufer verwalten",
            desc: `${buyers.length} Käufer, ${activeBuyers} aktiv`,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
          >
            <p className="font-semibold text-sm text-gray-900 mb-1">
              {item.title}
            </p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </PortalShell>
  );
}
