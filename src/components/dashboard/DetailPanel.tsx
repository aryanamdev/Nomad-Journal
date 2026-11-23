"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOOD_META, WEATHER_META, formatDate } from "@/lib/entryMeta";
import { useJournalStore } from "@/store/useJournalStore";
import type { Entry } from "@/types/entry";
import type { Journal } from "@/types/journal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EntryEditor } from "./EntryEditor";
import { JournalDialog } from "./JournalDialog";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => <div className="bg-muted h-full w-full" />,
});

function EntryDetail({ entry, journal }: { entry: Entry; journal?: Journal }) {
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const coords = entry.location?.coordinates;

  const feel = [
    entry.mood && MOOD_META[entry.mood] && `${MOOD_META[entry.mood].emoji} Felt ${MOOD_META[entry.mood].label.toLowerCase()}`,
    entry.weather && WEATHER_META[entry.weather] && `${WEATHER_META[entry.weather].emoji} ${WEATHER_META[entry.weather].label}`,
  ].filter(Boolean);

  return (
    <article className="grid">
      <div className="flex items-center justify-between px-6 pt-5 lg:px-8">
        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => selectEntry(null)}>
          <ArrowLeft /> Close
        </Button>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirming(true)} aria-label="Delete entry">
            <Trash2 />
          </Button>
        </div>
      </div>

      {coords && (
        <div className="mx-6 mt-5 h-40 overflow-hidden rounded-md border lg:mx-8">
          <MiniMap lat={coords[1]} lng={coords[0]} color={journal?.color ?? "#2346c0"} />
        </div>
      )}

      <header className="px-6 pt-6 lg:px-8">
        {journal && (
          <p className="font-caption text-sm" style={{ color: journal.color }}>
            {journal.title}
          </p>
        )}
        <h2 className="font-display mt-1 text-[2.4rem] text-balance">{entry.title}</h2>
        <p className="font-caption text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem]">
          <span>{formatDate(entry.entryDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          {entry.placeName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {entry.placeName}
            </span>
          )}
        </p>
        {feel.length > 0 && <p className="text-ink/80 mt-1.5 flex flex-wrap gap-x-4 text-sm">{feel.map((f) => <span key={f as string}>{f}</span>)}</p>}
      </header>

      <div className="ruled mx-6 mt-6 lg:mx-8">
        {entry.content ? (
          <p className="font-story text-ink text-[1.06rem] leading-7 whitespace-pre-wrap">{entry.content}</p>
        ) : (
          <p className="font-story text-muted-foreground leading-7 italic">Nothing written for this day yet.</p>
        )}
      </div>

      {!!entry.tags?.length && (
        <p className="text-pen mx-6 mt-5 flex flex-wrap gap-x-3 text-sm lg:mx-8">
          {entry.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </p>
      )}

      {entry.updatedAt && (
        <p className="text-muted-foreground mx-6 mt-8 mb-8 text-xs lg:mx-8">Last edited {formatDate(entry.updatedAt)}</p>
      )}

      <EntryEditor open={editing} onOpenChange={setEditing} entry={entry} />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this entry?"
        description={`"${entry.title}" will be deleted for good.`}
        confirmLabel="Delete entry"
        onConfirm={async () => {
          try {
            await deleteEntry(entry._id);
            toast.success("Entry deleted");
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      />
    </article>
  );
}

function Overview() {
  const journals = useJournalStore((s) => s.journals);
  const entries = useJournalStore((s) => s.entries);
  const selectedJournalId = useJournalStore((s) => s.selectedJournalId);
  const deleteJournal = useJournalStore((s) => s.deleteJournal);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const journal = journals.find((j) => j._id === selectedJournalId);

  const stats = useMemo(() => {
    const places = new Set(entries.map((e) => e.placeName).filter(Boolean));
    const times = entries.map((e) => new Date(e.entryDate).getTime());
    const moods = new Map<string, number>();
    entries.forEach((e) => e.mood && moods.set(e.mood, (moods.get(e.mood) ?? 0) + 1));
    const topMood = [...moods].sort((a, b) => b[1] - a[1])[0]?.[0] as keyof typeof MOOD_META | undefined;
    const days = times.length ? Math.round((Math.max(...times) - Math.min(...times)) / 86_400_000) + 1 : 0;
    const tags = new Map<string, number>();
    entries.forEach((e) => e.tags?.forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1)));
    const topTags = [...tags].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
    return { places: places.size, days, topMood, topTags };
  }, [entries]);

  const facts: [string, string | number][] = [
    ["Entries", entries.length],
    ["Places", stats.places],
    ["Days covered", stats.days],
    ["Most common mood", stats.topMood ? `${MOOD_META[stats.topMood].emoji} ${MOOD_META[stats.topMood].label}` : "None yet"],
  ];

  return (
    <div className="px-6 py-8 lg:px-8">
      {journal && <span className="mb-4 block h-1.5 w-12 rounded-full" style={{ background: journal.color }} aria-hidden />}
      <h2 className="font-display text-[2.4rem] text-balance">{journal?.title ?? "All your travels"}</h2>
      <p className="font-story text-ink/80 mt-3 text-[1.06rem] leading-7">
        {journal
          ? journal.description || "No description yet. Add one to remember what this journal is about."
          : `${journals.length} ${journals.length === 1 ? "journal" : "journals"}. Pick an entry from the list to read it here.`}
      </p>

      <dl className="mt-8 grid grid-cols-2 border-t">
        {facts.map(([label, value], i) => (
          <div key={label} className={`border-b py-4 ${i % 2 === 0 ? "border-r pr-4" : "pl-4"}`}>
            <dt className="font-caption text-muted-foreground text-sm">{label}</dt>
            <dd className="font-display mt-1 text-[1.9rem] tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {stats.topTags.length > 0 && (
        <div className="mt-6">
          <h3 className="font-caption text-muted-foreground text-sm">Frequent tags</h3>
          <p className="text-pen mt-1.5 flex flex-wrap gap-x-3 text-sm">
            {stats.topTags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        </div>
      )}

      {journal && (
        <div className="mt-8 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit journal
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 /> Delete journal
          </Button>
          <JournalDialog open={editing} onOpenChange={setEditing} journal={journal} />
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title="Delete this journal?"
            description={`"${journal.title}" and its ${journal.entryCount ?? 0} entries will be deleted for good.`}
            confirmLabel="Delete journal"
            onConfirm={async () => {
              try {
                await deleteJournal(journal._id);
                toast.success("Journal deleted");
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DetailPanel() {
  const entries = useJournalStore((s) => s.entries);
  const journals = useJournalStore((s) => s.journals);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const entry = entries.find((e) => e._id === selectedEntryId);

  return entry ? <EntryDetail entry={entry} journal={journals.find((j) => j._id === entry.journalId)} /> : <Overview />;
}
