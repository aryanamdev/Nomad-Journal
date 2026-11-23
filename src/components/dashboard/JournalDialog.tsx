"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JOURNAL_COLORS } from "@/lib/entryMeta";
import { useJournalStore } from "@/store/useJournalStore";
import type { Journal } from "@/types/journal";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; journal?: Journal };

export function JournalDialog({ open, onOpenChange, journal }: Props) {
  const createJournal = useJournalStore((s) => s.createJournal);
  const updateJournal = useJournalStore((s) => s.updateJournal);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(JOURNAL_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(journal?.title ?? "");
    setDescription(journal?.description ?? "");
    setColor(journal?.color ?? JOURNAL_COLORS[Math.floor(Math.random() * JOURNAL_COLORS.length)]);
  }, [open, journal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const input = { title: title.trim(), description: description.trim(), color };
      if (journal) {
        await updateJournal(journal._id, input);
        toast.success("Journal updated");
      } else {
        await createJournal(input);
        toast.success("Journal created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{journal ? "Edit journal" : "New journal"}</DialogTitle>
            <DialogDescription>A journal holds the entries for one trip, season or theme.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="journal-title">Title</Label>
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer 2026 in Japan"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="journal-description">Description</Label>
            <Textarea
              id="journal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this journal about?"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Journal color">
              {JOURNAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === color}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className="grid size-8 place-items-center rounded-full ring-offset-2 transition focus-visible:ring-2 focus-visible:outline-none"
                  style={{ background: c, boxShadow: c === color ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined }}
                >
                  {c === color && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving…" : journal ? "Save changes" : "Create journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
