import { redirect } from "next/navigation";
import { getCurrentBuyer } from "@/lib/portal/data";
import { createServerClient } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";
import { Users } from "lucide-react";

export const metadata = { title: "Team – Portal" };

export default async function TeamPage() {
  const buyer = await getCurrentBuyer();
  if (!buyer) redirect("/portal/login");

  const db = createServerClient();
  const { data: team } = await db
    .from("buyer_team")
    .select("*")
    .eq("buyer_id", buyer.id);

  const members = team ?? [];

  return (
    <PortalShell
      isAdmin={buyer.role === "admin"}
      buyerName={buyer.company_name}
      pageTitle="Team"
    >
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-gray-500">
          Team-Mitglieder die Zugriff auf das Portal haben.
        </p>

        {members.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              Noch keine weiteren Team-Mitglieder angelegt.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Wende dich an den Admin um neue Mitglieder hinzuzufügen.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    E-Mail
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Rolle
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {m.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{m.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.role === "owner"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {m.role === "owner" ? "Inhaber" : "Mitglied"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
