"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import {
  updateAssignmentStatus,
  updateAssignmentNotes,
  updateAssignmentFollowup,
} from "@/lib/portal/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  STATUS_LABELS,
  RECLAIM_REASONS,
} from "@/lib/portal/types";
import type { LeadStatus, LeadAssignment } from "@/lib/portal/types";
import { AlertTriangle } from "lucide-react";

interface Props {
  assignment: LeadAssignment;
  leadCreatedAt: string;
}

export default function CrmPanel({ assignment, leadCreatedAt }: Props) {
  const [status, setStatus] = useState<LeadStatus>(assignment.status);
  const [notes, setNotes] = useState(assignment.notes ?? "");
  const [followup, setFollowup] = useState(assignment.next_followup ?? "");
  const [reclaimOpen, setReclaimOpen] = useState(false);
  const [reclaimReason, setReclaimReason] = useState<string>(RECLAIM_REASONS[0]);
  const [notesSaved, setNotesSaved] = useState(false);
  const [, startTransition] = useTransition();

  const leadAge =
    (Date.now() - new Date(leadCreatedAt).getTime()) / 86_400_000;
  const canReclaim = assignment.status === "new" && leadAge <= 7;

  function handleStatusChange(newStatus: LeadStatus) {
    if (newStatus === "reclaimed") {
      setReclaimOpen(true);
      return;
    }
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateAssignmentStatus(assignment.id, newStatus);
        toast.success("Status gespeichert.");
      } catch {
        toast.error("Fehler beim Speichern.");
      }
    });
  }

  const saveNotes = useCallback(() => {
    startTransition(async () => {
      try {
        await updateAssignmentNotes(assignment.id, notes);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      } catch {
        toast.error("Fehler beim Speichern.");
      }
    });
  }, [assignment.id, notes]);

  function handleFollowupChange(val: string) {
    setFollowup(val);
    startTransition(async () => {
      try {
        await updateAssignmentFollowup(assignment.id, val || null);
        toast.success("Follow-up gespeichert.");
      } catch {
        toast.error("Fehler beim Speichern.");
      }
    });
  }

  async function handleReclaim() {
    try {
      await updateAssignmentStatus(assignment.id, "reclaimed", reclaimReason);
      setStatus("reclaimed");
      setReclaimOpen(false);
      toast.success("Lead reklamiert.");
    } catch {
      toast.error("Fehler beim Reklamieren.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Status
        </Label>
        <Select value={status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Follow-up date */}
      <div className="space-y-2">
        <Label
          htmlFor="followup"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
        >
          Nächstes Follow-up
        </Label>
        <input
          id="followup"
          type="date"
          value={followup}
          onChange={(e) => handleFollowupChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label
          htmlFor="notes"
          className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
        >
          Notizen
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Gesprächsnotiz, Vereinbarungen…"
          rows={5}
          className="resize-none text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={saveNotes}
          className="w-full text-xs"
        >
          {notesSaved ? "✓ Gespeichert" : "Notizen speichern"}
        </Button>
      </div>

      {/* Reclaim */}
      {canReclaim && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle size={15} />
            <p className="text-xs font-semibold">Lead reklamieren</p>
          </div>
          <p className="text-xs text-amber-600 leading-relaxed">
            Nur möglich innerhalb von 7 Tagen nach Eingang und wenn der Lead
            noch auf &bdquo;Neu&rdquo; steht.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => setReclaimOpen(true)}
          >
            Reklamation einreichen
          </Button>
        </div>
      )}

      {/* Reclaim modal */}
      <Dialog open={reclaimOpen} onOpenChange={setReclaimOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lead reklamieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">
              Bitte wähle den Grund für die Reklamation:
            </p>
            <div className="space-y-2">
              {RECLAIM_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reclaimReason"
                    value={reason}
                    checked={reclaimReason === reason}
                    onChange={() => setReclaimReason(reason)}
                    className="accent-green-700"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReclaimOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleReclaim}
            >
              Reklamation bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
