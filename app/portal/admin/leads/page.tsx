import { redirect } from "next/navigation";
import { getCurrentBuyer, getAllLeadsWithAssignment, getAllBuyers } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import AdminLeadsTable from "@/components/portal/AdminLeadsTable";

export const metadata = { title: "Alle Leads – Admin" };

export default async function AdminLeadsPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  const [rows, buyers] = await Promise.all([
    getAllLeadsWithAssignment(),
    getAllBuyers(),
  ]);

  const buyerOptions = buyers.map((b) => ({
    id: b.id,
    company_name: b.company_name,
  }));

  // Normalise Supabase join shape (buyers can come back as array) to match Row type
  const normalisedRows = rows.map((r) => ({
    lead: r.lead,
    assignment: r.assignment
      ? {
          lead_id: r.assignment.lead_id as string,
          buyer_id: r.assignment.buyer_id as string,
          status: r.assignment.status as string,
          buyers: Array.isArray(r.assignment.buyers)
            ? (r.assignment.buyers[0] as { id: string; company_name: string } | undefined) ?? null
            : (r.assignment.buyers as { id: string; company_name: string } | null),
        }
      : null,
  }));

  return (
    <PortalShell isAdmin buyerName={buyer.company_name} pageTitle="Alle Leads">
      <AdminLeadsTable rows={normalisedRows} buyers={buyerOptions} />
    </PortalShell>
  );
}
