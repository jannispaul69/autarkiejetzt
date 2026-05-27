import { redirect } from "next/navigation";
import { getCurrentBuyer } from "@/lib/portal/data";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = { title: "Einstellungen – Admin" };

export default async function AdminSettingsPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer || buyer.role !== "admin") redirect("/portal/dashboard");

  return (
    <PortalShell isAdmin buyerName={buyer.company_name} pageTitle="Einstellungen">
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            System
          </h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Plattform", "Autarkie Jetzt"],
              ["Version", "1.0.0"],
              ["Umgebung", process.env.NODE_ENV ?? "–"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-32 text-xs text-gray-400 uppercase tracking-wide font-medium">
                  {k}
                </dt>
                <dd className="text-gray-700 font-mono text-xs">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800 mb-1">
            Weitere Einstellungen
          </p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Lead-Preise, E-Mail-Vorlagen und weitere Konfigurationen werden
            in einem späteren Release hier verfügbar sein.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
