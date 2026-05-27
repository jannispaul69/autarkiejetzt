import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentBuyer, getAllBuyers } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import CreateBuyerModal from "@/components/portal/CreateBuyerModal";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Käufer – Admin" };

async function getBuyerLeadCounts(buyerIds: string[]) {
  if (buyerIds.length === 0) return {} as Record<string, number>;
  const db = createServerClient();
  const { data } = await db
    .from("lead_assignments")
    .select("buyer_id")
    .in("buyer_id", buyerIds);
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r) => {
    counts[r.buyer_id] = (counts[r.buyer_id] ?? 0) + 1;
  });
  return counts;
}

export default async function AdminBuyersPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  const buyers = await getAllBuyers();
  const counts = await getBuyerLeadCounts(buyers.map((b) => b.id));

  return (
    <PortalShell isAdmin buyerName={buyer.company_name} pageTitle="Käufer verwalten">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {buyers.length} Käufer registriert
        </p>
        <CreateBuyerModal />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {buyers.length === 0 ? (
          <p className="p-8 text-sm text-gray-400 text-center">
            Noch keine Käufer angelegt.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Firma",
                  "E-Mail",
                  "Aktive Leads",
                  "Guthaben",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {b.company_name}
                    </p>
                    <p className="text-xs text-gray-400">{b.contact_name}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {b.email}
                  </td>
                  <td className="px-5 py-3 text-gray-700 tabular-nums">
                    {counts[b.id] ?? 0}
                  </td>
                  <td className="px-5 py-3 text-gray-700 tabular-nums">
                    {(b.prepaid_balance / 100).toFixed(2)} €
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        b.is_active
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {b.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/portal/admin/buyers/${b.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#0A4D3C" }}
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalShell>
  );
}
