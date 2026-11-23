"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOOD_META, WEATHER_META, formatDate } from "@/lib/entryMeta";
import { useJournalStore } from "@/store/useJournalStore";
import type { Entry } from "@/types/entry";
import type { Journal } from "@/types/journal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EntryEditor } from "./EntryEditor";
import { JournalDialog } from "./JournalDialog";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

function EntryDetail({ entry, journal }: { entry: Entry; journal?: Journal }) {
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="grid gap-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => selectEntry(null)}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit
          </Button>
          <Button variant="outline" size="icon" onClick={() => setConfirming(true)} aria-label="Delete entry">
            <Trash2 />
          </Button>
        </div>
      </div>

      <header className="grid gap-2">
        {journal && (
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <span className="size-2 rounded-full" style={{ background: journal.color }} />
            {journal.title}
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight">{entry.title}</h2>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" />
            {formatDate(entry.entryDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          {entry.placeName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {entry.placeName}
            </span>
          )}
        </div>
      </header>

      {(entry.mood || entry.weather) && (
        <div className="flex flex-wrap gap-2">
          {entry.mood && MOOD_META[entry.mood] && (
            <span className="bg-secondary rounded-full px-3 py-1 text-sm">
              {MOOD_META[entry.mood].emoji} Feeling {MOOD_META[entry.mood].label.toLowerCase()}
            </span>
          )}
          {entry.weather && WEATHER_META[entry.weather] && (
            <span className="bg-secondary rounded-full px-3 py-1 text-sm">
              {WEATHER_META[entry.weather].emoji} {WEATHER_META[entry.weather].label}
            </span>
          )}
        </div>
      )}

      {entry.content ? (
        <p className="leading-7 whitespace-pre-wrap">{entry.content}</p>
      ) : (
        <p className="text-muted-foreground text-sm italic">No story written yet.</p>
      )}

      {!!entry.tags?.length && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <span key={t} className="bg-secondary rounded-full px-2.5 py-0.5 text-xs">
              #{t}
            </span>
          ))}
        </div>
      )}

      {entry.updatedAt && (
        <p className="text-muted-foreground border-t pt-3 text-xs">Last edited {formatDate(entry.updatedAt)}</p>
      )}

      <EntryEditor open={editing} onOpenChange={setEditing} entry={entry} />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this entry?"
        description={`"${entry.title}" will be permanently deleted.`}
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
  const search = useJournalStore((s) => s.search);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const journal = journals.find((j) => j._id === selectedJournalId);

  const stats = useMemo(() => {
    const places = new Set(entries.map((e) => e.placeName).filter(Boolean));
    const dates = entries.map((e) => new Date(e.entryDate).getTime());
    const moods = new Map<string, number>();
    entries.forEach((e) => e.mood && moods.set(e.mood, (moods.get(e.mood) ?? 0) + 1));
    const topMood = [...moods].sort((a, b) => b[1] - a[1])[0]?.[0] as keyof typeof MOOD_META | undefined;
    return {
      places: places.size,
      first: dates.length ? new Date(Math.min(...dates)) : null,
      last: dates.length ? new Date(Math.max(...dates)) : null,
      topMood,
    };
  }, [entries]);

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {journal ? "Journal" : "Overview"}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{journal?.title ?? "All your journals"}</h2>
        {journal?.description ? (
          <p className="text-muted-foreground text-sm leading-6">{journal.description}</p>
        ) : (
          !journal && (
            <p className="text-muted-foreground text-sm">
              {journals.length} {journals.length === 1 ? "journal" : "journals"}. Select an entry to read it here.
            </p>
          )
        )}
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Stat label={search ? "Matching entries" : "Entries"} value={entries.length} />
        <Stat label="Places" value={stats.places} />
        <Stat
          label="Top mood"
          value={stats.topMood ? `${MOOD_META[stats.topMood].emoji} ${MOOD_META[stats.topMood].label}` : "–"}
        />
        <Stat
          label="Days covered"
          value={stats.first && stats.last ? Math.round((+stats.last - +stats.first) / 86_400_000) + 1 : 0}
        />
      </div>

      {stats.first && stats.last && (
        <p className="text-muted-foreground text-sm">
          {formatDate(stats.first)} – {formatDate(stats.last)}
        </p>
      )}

      {journal && (
        <div className="flex gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Edit journal
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 /> Delete
          </Button>
          <JournalDialog open={editing} onOpenChange={setEditing} journal={journal} />
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title="Delete this journal?"
            description={`"${journal.title}" and its ${journal.entryCount ?? 0} entries will be permanently deleted.`}
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
