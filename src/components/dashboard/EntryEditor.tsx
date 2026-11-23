"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Crosshair, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MOOD_META, WEATHER_META, fromDateInput, toDateInput } from "@/lib/entryMeta";
import { cn } from "@/lib/utils";
import { useJournalStore } from "@/store/useJournalStore";
import type { Entry, EntryInput, Mood, Weather } from "@/types/entry";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
  loading: () => <div className="bg-muted h-full w-full animate-pulse rounded-md" />,
});

type LatLng = { lat: number; lng: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: Entry;
  /** Journal to preselect for a new entry */
  defaultJournalId?: string | null;
};

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<T, { emoji: string; label: string }>;
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            onClick={() => onChange(value === key ? null : key)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition",
              value === key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            <span aria-hidden>{options[key].emoji}</span> {options[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EntryEditor({ open, onOpenChange, entry, defaultJournalId }: Props) {
  const journals = useJournalStore((s) => s.journals);
  const createEntry = useJournalStore((s) => s.createEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);

  const [title, setTitle] = useState("");
  const [journalId, setJournalId] = useState("");
  const [date, setDate] = useState(toDateInput(new Date()));
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [point, setPoint] = useState<LatLng | null>(null);
  const [finding, setFinding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? "");
    setJournalId(entry?.journalId ?? defaultJournalId ?? journals[0]?._id ?? "");
    setDate(toDateInput(entry?.entryDate ?? new Date()));
    setContent(entry?.content ?? "");
    setMood(entry?.mood ?? null);
    setWeather(entry?.weather ?? null);
    setTags(entry?.tags ?? []);
    setTagDraft("");
    setPlaceName(entry?.placeName ?? "");
    const c = entry?.location?.coordinates;
    setPoint(c ? { lng: c[0], lat: c[1] } : null);
  }, [open, entry, defaultJournalId, journals]);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "").toLowerCase().slice(0, 30);
    if (tag && !tags.includes(tag) && tags.length < 10) setTags([...tags, tag]);
    setTagDraft("");
  };

  const findPlace = async () => {
    if (!placeName.trim()) return;
    setFinding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeName.trim())}`,
        { headers: { Accept: "application/json" } }
      );
      const [hit] = (await res.json()) as { lat: string; lon: string }[];
      if (!hit) throw new Error("not found");
      setPoint({ lat: Number(hit.lat), lng: Number(hit.lon) });
    } catch {
      toast.error("Couldn't find that place. Click the map to set it instead.");
    } finally {
      setFinding(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share its location");
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Location permission was denied")
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !journalId) return;
    setSaving(true);
    const pendingTag = tagDraft.trim() ? [tagDraft.trim().replace(/^#/, "").toLowerCase()] : [];
    const input: EntryInput = {
      title: title.trim(),
      journalId,
      content,
      entryDate: fromDateInput(date),
      mood,
      weather,
      tags: [...new Set([...tags, ...pendingTag])],
      placeName: placeName.trim(),
      location: point ? { type: "Point", coordinates: [point.lng, point.lat] } : null,
    };
    try {
      if (entry) {
        await updateEntry(entry._id, input);
        toast.success("Entry updated");
      } else {
        // New entries leave empty optional fields out entirely.
        await createEntry({
          ...input,
          mood: input.mood ?? undefined,
          weather: input.weather ?? undefined,
          location: input.location ?? undefined,
        });
        toast.success("Entry saved");
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{entry ? "Edit entry" : "New entry"}</DialogTitle>
            <DialogDescription>Write down what happened, where, and how it felt.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="entry-title">Title</Label>
              <Input
                id="entry-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunrise over the lake"
                maxLength={140}
                required
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry-date">Date</Label>
              <Input id="entry-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entry-journal">Journal</Label>
            <select
              id="entry-journal"
              value={journalId}
              onChange={(e) => setJournalId(e.target.value)}
              className="border-input focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              required
            >
              {journals.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entry-content">Story</Label>
            <Textarea
              id="entry-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you see, eat, hear?"
              rows={6}
              maxLength={20000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChipGroup label="Mood" options={MOOD_META} value={mood} onChange={setMood} />
            <ChipGroup label="Weather" options={WEATHER_META} value={weather} onChange={setWeather} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entry-tags">Tags</Label>
            <div className="border-input focus-within:ring-ring/50 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-[3px]">
              {tags.map((t) => (
                <span key={t} className="bg-secondary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
                  #{t}
                  <button type="button" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="entry-tags"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagDraft);
                  } else if (e.key === "Backspace" && !tagDraft && tags.length) {
                    setTags(tags.slice(0, -1));
                  }
                }}
                onBlur={() => tagDraft && addTag(tagDraft)}
                placeholder={tags.length ? "" : "food, hiking… press Enter to add"}
                className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entry-place">Location</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                <Input
                  id="entry-place"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void findPlace();
                    }
                  }}
                  placeholder="Place name, e.g. Kyoto"
                  className="pl-8"
                  maxLength={120}
                />
              </div>
              <Button type="button" variant="outline" onClick={findPlace} disabled={finding || !placeName.trim()}>
                <Search /> {finding ? "Finding…" : "Find"}
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={useMyLocation} aria-label="Use my current location">
                <Crosshair />
              </Button>
            </div>
            <div className="h-56 overflow-hidden rounded-md border">
              {open && <LocationPicker value={point} onChange={setPoint} />}
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>{point ? `Pinned at ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : "Click the map to pin where this happened."}</span>
              {point && (
                <button type="button" className="underline underline-offset-2" onClick={() => setPoint(null)}>
                  Remove pin
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim() || !journalId}>
              {saving ? "Saving…" : entry ? "Save changes" : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
