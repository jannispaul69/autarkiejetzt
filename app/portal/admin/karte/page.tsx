import { redirect } from "next/navigation";
import { getCurrentBuyer, getAllLeadsForAdminMap, getAllBuyers } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import LeadMapView from "@/components/portal/LeadMapView";

export const metadata = { title: "Karte (Admin) – Autarkie Jetzt" };

export default async function AdminKartePage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  const [leads, buyers] = await Promise.all([
    getAllLeadsForAdminMap(),
    getAllBuyers(),
  ]);

  const buyerOptions = buyers.map((b) => ({ id: b.id, name: b.company_name }));

  return (
    <PortalShell isAdmin buyerName={buyer.company_name} pageTitle="Karte (Admin)">
      <LeadMapView leads={leads} isAdmin buyerOptions={buyerOptions} />
    </PortalShell>
  );
}
