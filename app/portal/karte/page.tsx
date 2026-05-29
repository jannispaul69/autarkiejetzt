import { redirect } from "next/navigation";
import { getCurrentBuyer, getBuyerLeadsForMap } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import LeadMapView from "@/components/portal/LeadMapView";

export const metadata = { title: "Karte – Autarkie Jetzt" };

export default async function KartePage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const leads = await getBuyerLeadsForMap(buyer.id);

  return (
    <PortalShell isAdmin={buyer.role === "admin"} buyerName={buyer.company_name} pageTitle="Karte">
      <LeadMapView leads={leads} />
    </PortalShell>
  );
}
