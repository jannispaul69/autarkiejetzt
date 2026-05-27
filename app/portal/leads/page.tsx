import { redirect } from "next/navigation";
import { getCurrentBuyer, getBuyerLeads } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";
import LeadsTable from "@/components/portal/LeadsTable";

export const metadata = { title: "Meine Leads – Portal" };

export default async function LeadsPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const leads = await getBuyerLeads(buyer.id);

  return (
    <PortalShell
      isAdmin={buyer.role === "admin"}
      buyerName={buyer.company_name}
      pageTitle="Meine Leads"
    >
      <LeadsTable rows={leads} />
    </PortalShell>
  );
}
