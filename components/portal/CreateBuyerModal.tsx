"use client";

import { useState, useTransition } from "react";
import { createBuyer } from "@/lib/portal/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export default function CreateBuyerModal() {
  const [open, setOpen] = useState(false);
  const [postalTags, setPostalTags] = useState<string[]>([]);
  const [postalInput, setPostalInput] = useState("");
  const [, startTransition] = useTransition();

  function addPostalTag() {
    const val = postalInput.trim();
    if (val && !postalTags.includes(val)) {
      setPostalTags((prev) => [...prev, val]);
    }
    setPostalInput("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("postal_codes", postalTags.join(","));

    startTransition(async () => {
      try {
        await createBuyer(fd);
        toast.success("Käufer angelegt.");
        setOpen(false);
        setPostalTags([]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Fehler beim Anlegen."
        );
      }
    });
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
        style={{ backgroundColor: "#0A4D3C" }}
      >
        <Plus size={15} />
        Neuen Käufer anlegen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Käufer anlegen</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Firma *</Label>
                <Input id="company_name" name="company_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Ansprechpartner *</Label>
                <Input id="contact_name" name="contact_name" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cb-email">E-Mail *</Label>
              <Input id="cb-email" name="email" type="email" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead_budget_per_week">Leads/Woche</Label>
                <Input
                  id="lead_budget_per_week"
                  name="lead_budget_per_week"
                  type="number"
                  min={1}
                  defaultValue={10}
                />
              </div>
            </div>

            {/* PLZ tags */}
            <div className="space-y-1.5">
              <Label>PLZ-Präfixe (z. B. 27, 28)</Label>
              <div className="flex gap-2">
                <Input
                  value={postalInput}
                  onChange={(e) => setPostalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPostalTag();
                    }
                  }}
                  placeholder="27"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPostalTag}
                >
                  +
                </Button>
              </div>
              {postalTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {postalTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setPostalTags((p) => p.filter((x) => x !== t))
                        }
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Initiales Passwort *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-400">
                Der Käufer kann es später selbst ändern.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                size="sm"
                style={{ backgroundColor: "#0A4D3C" }}
              >
                Anlegen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
