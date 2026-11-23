"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, List, Map as MapIcon, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useJournalStore, type EntryView } from "@/store/useJournalStore";
import type { Entry } from "@/types/entry";
import { EntryList } from "./EntryList";
import { EntryCalendar } from "./EntryCalendar";
import { EntryEditor } from "./EntryEditor";
import { JournalDialog } from "./JournalDialog";

const EntriesMap = dynamic(() => import("@/components/map/EntriesMap"), {
  ssr: false,
  loading: () => <div className="bg-muted h-full w-full animate-pulse rounded-lg" />,
});

const VIEWS: { id: EntryView; label: string; icon: typeof List }[] = [
  { id: "list", label: "List", icon: List },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "map", label: "Map", icon: MapIcon },
];

export function EntriesPanel() {
  const me = useJournalStore((s) => s.me);
  const journals = useJournalStore((s) => s.journals);
  const entries = useJournalStore((s) => s.entries);
  const selectedJournalId = useJournalStore((s) => s.selectedJournalId);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const view = useJournalStore((s) => s.view);
  const setView = useJournalStore((s) => s.setView);
  const setSearch = useJournalStore((s) => s.setSearch);
  const loading = useJournalStore((s) => s.loading.entries);

  const [query, setQuery] = useState("");
  const [writing, setWriting] = useState(false);
  const [creatingJournal, setCreatingJournal] = useState(false);

  // Debounce search so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, setSearch]);

  // Clear the search box when switching journals.
  useEffect(() => setQuery(""), [selectedJournalId]);

  const journalsById = useMemo(() => new Map(journals.map((j) => [j._id, j])), [journals]);
  const journal = selectedJournalId ? journalsById.get(selectedJournalId) : undefined;
  const colorFor = useCallback((e: Entry) => journalsById.get(e.journalId)?.color ?? "#4f6470", [journalsById]);
  const locatedCount = entries.filter((e) => e.location).length;

  const empty = !loading && entries.length === 0;

  const span = useMemo(() => {
    if (!entries.length) return null;
    const times = entries.map((e) => +new Date(e.entryDate));
    const first = new Date(Math.min(...times));
    const last = new Date(Math.max(...times));
    const sameYear = first.getFullYear() === last.getFullYear();
    const short: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) };
    return `${first.toLocaleDateString(undefined, short)} to ${last.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
  }, [entries]);

  return (
    <section className="flex min-h-0 flex-col" aria-label="Entries">
      {me?.isDemo && (
        <p className="bg-ink text-page/90 flex items-center gap-3 px-5 py-2 text-sm lg:px-8">
          <span className="min-w-0 flex-1">This is a shared demo. Anything you write resets every few hours.</span>
          <Link href="/register" className="text-page shrink-0 font-medium underline underline-offset-4">
            Start your own journal
          </Link>
        </p>
      )}

      <header className="grid gap-5 px-5 pt-7 pb-5 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-ink truncate text-[2.6rem] sm:text-5xl">{journal?.title ?? "Every journal"}</h1>
            <p className="font-caption text-muted-foreground mt-2 flex flex-wrap gap-x-4 text-[0.95rem]">
              <span>
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
                {query && " found"}
              </span>
              {span && <span>{span}</span>}
              {locatedCount > 0 && (
                <span>
                  {locatedCount} {locatedCount === 1 ? "place" : "places"} pinned
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setWriting(true)} disabled={journals.length === 0} className="shrink-0">
            <PenLine /> <span className="hidden sm:inline">Write an entry</span>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search entries</span>
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, places and tags"
              className="bg-page/70 h-10 pl-9"
            />
          </label>
          <div className="border-input inline-flex rounded-md border p-0.5" role="tablist" aria-label="View entries as">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[4px] px-3 text-sm transition-colors",
                  view === id ? "bg-ink text-page" : "text-ink/70 hover:text-ink"
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={cn("min-h-0 flex-1 overflow-y-auto px-3 pb-8 lg:px-6", view === "map" && "flex flex-col px-5 lg:px-8")}>
        {journals.length === 0 ? (
          <div className="mx-auto grid max-w-sm justify-items-start gap-3 py-16">
            <h2 className="font-display text-3xl">Start your first journal</h2>
            <p className="font-story text-ink/80 text-lg leading-relaxed">
              A journal holds one trip, season or theme, like a summer in Japan or a month of weekend walks.
            </p>
            <Button onClick={() => setCreatingJournal(true)}>Create a journal</Button>
          </div>
        ) : view === "map" ? (
          <div className="flex min-h-[420px] flex-1 flex-col gap-2">
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
              <EntriesMap entries={entries} colorFor={colorFor} selectedId={selectedEntryId} onSelect={selectEntry} />
            </div>
            <p className="font-caption text-muted-foreground text-sm">
              {entries.length - locatedCount > 0
                ? `${entries.length - locatedCount} ${entries.length - locatedCount === 1 ? "entry has" : "entries have"} no location, so ${entries.length - locatedCount === 1 ? "it isn't" : "they aren't"} on the map.`
                : "Dashed lines follow each journal's route in date order."}
            </p>
          </div>
        ) : empty ? (
          <div className="mx-auto grid max-w-sm justify-items-start gap-3 py-16">
            <h2 className="font-display text-3xl">{query ? "No entries match" : "Nothing written yet"}</h2>
            <p className="font-story text-ink/80 text-lg leading-relaxed">
              {query
                ? "Try a place, a tag or a word from the story."
                : "Write about today, a place you passed through or something you noticed."}
            </p>
            {!query && <Button onClick={() => setWriting(true)}>Write an entry</Button>}
          </div>
        ) : view === "calendar" ? (
          <div className="px-2 lg:px-2">
            <EntryCalendar entries={entries} colorFor={colorFor} selectedId={selectedEntryId} onSelect={selectEntry} />
          </div>
        ) : (
          <EntryList
            entries={entries}
            journalsById={journalsById}
            showJournal={!selectedJournalId}
            selectedId={selectedEntryId}
            onSelect={selectEntry}
          />
        )}
      </div>

      <EntryEditor open={writing} onOpenChange={setWriting} defaultJournalId={selectedJournalId} />
      <JournalDialog open={creatingJournal} onOpenChange={setCreatingJournal} />
    </section>
  );
}
