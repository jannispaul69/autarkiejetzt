import { redirect } from "next/navigation";
import { getCurrentBuyer, getMarketplaceLeads, getPortalSettings } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import MarketplaceGrid from "@/components/portal/MarketplaceGrid";

export const metadata = { title: "Marktplatz – Autarkie Jetzt" };

export default async function MarktplatzPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const [leads, settings] = await Promise.all([
    getMarketplaceLeads(buyer.id),
    getPortalSettings(),
  ]);

  return (
    <PortalShell isAdmin={buyer.role === "admin"} buyerName={buyer.company_name} pageTitle="Marktplatz">
      <MarketplaceGrid leads={leads} buyer={buyer} settings={settings} />
    </PortalShell>
  );
}
