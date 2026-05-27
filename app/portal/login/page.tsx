"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortalBrowserClient } from "@/lib/supabase/portal-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Inner component uses useSearchParams — must be inside Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/portal/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = createPortalBrowserClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Falsche E-Mail oder Passwort.");
      return;
    }
    router.push("/portal/dashboard");
    router.refresh();
  }

  async function handleReset() {
    if (!email) {
      toast.error("Bitte zuerst E-Mail-Adresse eingeben.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/login`,
    });
    if (error) {
      toast.error("Fehler beim Senden. Bitte versuche es erneut.");
    } else {
      setResetSent(true);
      toast.success("Reset-Link wurde gesendet!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* Header card */}
        <div
          className="rounded-t-2xl px-8 py-6 text-white"
          style={{ backgroundColor: "#0A4D3C" }}
        >
          <p className="text-sm font-semibold tracking-wide opacity-70 mb-2">
            ☀️ AUTARKIE JETZT
          </p>
          <h1 className="text-xl font-bold">Partner-Portal</h1>
          <p className="text-sm opacity-60 mt-1">Bitte melde dich an.</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-b-2xl shadow-xl px-8 py-7 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="deine@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "#0A4D3C" }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmelden…
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          {resetSent ? (
            <p className="text-center text-sm text-green-700">
              Reset-Link wurde gesendet. Bitte prüfe dein E-Mail-Postfach.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Passwort vergessen?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
