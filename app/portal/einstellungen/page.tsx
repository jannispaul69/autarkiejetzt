"use client";

import { useEffect, useState, useTransition } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { inviteTeamMember } from "@/lib/portal/actions";
import { toast } from "sonner";
import { createPortalBrowserClient } from "@/lib/supabase/portal-browser";
import type { Buyer, BuyerTeamMember } from "@/lib/portal/types";
import { Lock, Bell, Users, Mail } from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon size={15} className="text-gray-400" />
        <p className="font-semibold text-sm text-gray-800">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function EinstellungenPage() {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [team, setTeam] = useState<BuyerTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Password form
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Notification form
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyImmediate, setNotifyImmediate] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(false);

  // Team invite
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/me").then((r) => r.json()),
      fetch("/api/portal/team").then((r) => r.json()).catch(() => []),
    ]).then(([me, t]) => {
      setBuyer(me);
      setTeam(Array.isArray(t) ? t : []);
      setNotifyEmail(me?.notification_email ?? "");
      setNotifyImmediate(me?.notify_immediately ?? true);
      setNotifyDaily(me?.notify_daily_summary ?? false);
      setLoading(false);
    });
  }, []);

  function handlePasswordChange() {
    if (!newPw || newPw.length < 6) { toast.error("Passwort muss mindestens 6 Zeichen lang sein."); return; }
    if (newPw !== confirmPw) { toast.error("Passwörter stimmen nicht überein."); return; }
    startTransition(async () => {
      const supabase = createPortalBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) { toast.error(error.message); return; }
      toast.success("Passwort erfolgreich geändert.");
      setNewPw(""); setConfirmPw("");
    });
  }

  function handleSaveNotifications() {
    startTransition(async () => {
      const res = await fetch("/api/portal/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_email: notifyEmail || null,
          notify_immediately: notifyImmediate,
          notify_daily_summary: notifyDaily,
        }),
      });
      if (!res.ok) { toast.error("Fehler beim Speichern."); return; }
      toast.success("Benachrichtigungen gespeichert.");
    });
  }

  function handleInvite() {
    if (!inviteEmail || !buyer?.id) return;
    startTransition(async () => {
      try {
        await inviteTeamMember(buyer.id, inviteEmail);
        toast.success(`Einladung an ${inviteEmail} gesendet.`);
        setInviteEmail("");
        // Refresh team
        fetch("/api/portal/team").then((r) => r.json()).then((t) => setTeam(Array.isArray(t) ? t : []));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Fehler beim Einladen.");
      }
    });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Lädt…</div>
  );
  if (!buyer) return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Nicht eingeloggt.</div>
  );

  return (
    <PortalShell isAdmin={buyer.role === "admin"} buyerName={buyer.company_name} pageTitle="Einstellungen">
      <div className="max-w-xl space-y-5">

        {/* Password */}
        <Section title="Passwort ändern" icon={Lock}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Neues Passwort</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Passwort bestätigen</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
            </div>
            <Button
              size="sm"
              className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white"
              onClick={handlePasswordChange}
              disabled={!newPw || !confirmPw}
            >
              Passwort ändern
            </Button>
          </div>
        </Section>

        {/* Notification email */}
        <Section title="Benachrichtigungs-E-Mail" icon={Mail}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Abweichende E-Mail für Lead-Mails
                <span className="text-gray-400 ml-1">(Standard: {buyer.email})</span>
              </Label>
              <Input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder={buyer.email}
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSaveNotifications}>Speichern</Button>
          </div>
        </Section>

        {/* Notification settings */}
        <Section title="Benachrichtigungs-Einstellungen" icon={Bell}>
          <div className="space-y-4">
            {[
              { label: "Sofort bei neuem Lead", sub: "Direkte E-Mail bei jeder Zuweisung", value: notifyImmediate, set: setNotifyImmediate },
              { label: "Tägliche Zusammenfassung", sub: "Einmal täglich alle neuen Leads", value: notifyDaily, set: setNotifyDaily },
            ].map(({ label, sub, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
            <Button size="sm" className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white" onClick={handleSaveNotifications}>
              Speichern
            </Button>
          </div>
        </Section>

        {/* Team */}
        <Section title="Team verwalten" icon={Users}>
          <div className="space-y-4">
            {team.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Team-Mitglieder.</p>
            ) : (
              <table className="w-full text-sm mb-2">
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-900">{m.name}</td>
                      <td className="py-2 text-gray-500">{m.email}</td>
                      <td className="py-2 text-xs text-gray-400">{m.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Mitglied einladen (E-Mail)</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="kollege@firma.de"
                />
                <Button
                  size="sm"
                  className="bg-[#0A4D3C] hover:bg-[#0D5E4A] text-white"
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                >
                  Einladen
                </Button>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </PortalShell>
  );
}
