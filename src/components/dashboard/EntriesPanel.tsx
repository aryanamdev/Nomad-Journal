"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List, Map as MapIcon, PenLine, Search, Sparkles } from "lucide-react";
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
  const colorFor = (e: Entry) => journalsById.get(e.journalId)?.color ?? "#64748b";
  const locatedCount = entries.filter((e) => e.location).length;

  const empty = !loading && entries.length === 0;

  return (
    <section className="flex min-h-0 flex-col" aria-label="Entries">
      {me?.isDemo && (
        <div className="bg-primary/5 text-primary flex items-center gap-2 border-b px-4 py-2 text-sm lg:px-6">
          <Sparkles className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">You&apos;re exploring the demo. Changes are shared and reset every few hours.</span>
          <Link href="/register" className="shrink-0 font-medium underline underline-offset-4">
            Create your own
          </Link>
        </div>
      )}

      <header className="grid gap-3 border-b px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 truncate text-xl font-semibold tracking-tight">
              {journal && <span className="size-3 shrink-0 rounded-full" style={{ background: journal.color }} />}
              {journal?.title ?? "All entries"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {query && " matching your search"}
            </p>
          </div>
          <Button onClick={() => setWriting(true)} disabled={journals.length === 0}>
            <PenLine /> <span className="hidden sm:inline">New entry</span>
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, stories, places and tags"
              className="pl-8"
              aria-label="Search entries"
            />
          </div>
          <div className="bg-muted inline-flex rounded-lg p-1" role="tablist" aria-label="View">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
                  view === id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={cn("min-h-0 flex-1 overflow-y-auto p-4 lg:p-6", view === "map" && "flex flex-col")}>
        {journals.length === 0 ? (
          <div className="mx-auto grid max-w-sm place-items-center gap-3 py-16 text-center">
            <h2 className="text-lg font-semibold">Start your first journal</h2>
            <p className="text-muted-foreground text-sm">
              A journal holds the entries for one trip or theme, like &ldquo;Summer in Japan&rdquo;.
            </p>
            <Button onClick={() => setCreatingJournal(true)}>Create a journal</Button>
          </div>
        ) : view === "map" ? (
          <div className="flex min-h-[420px] flex-1 flex-col gap-2">
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
              <EntriesMap entries={entries} colorFor={colorFor} selectedId={selectedEntryId} onSelect={selectEntry} />
            </div>
            <p className="text-muted-foreground text-xs">
              {locatedCount} of {entries.length} entries have a location.
            </p>
          </div>
        ) : empty ? (
          <div className="mx-auto grid max-w-sm place-items-center gap-3 py-16 text-center">
            <h2 className="text-lg font-semibold">{query ? "Nothing matches that search" : "No entries yet"}</h2>
            <p className="text-muted-foreground text-sm">
              {query ? "Try a different word, place or tag." : "Write about your day, a place you visited or something you noticed."}
            </p>
            {!query && <Button onClick={() => setWriting(true)}>Write an entry</Button>}
          </div>
        ) : view === "calendar" ? (
          <EntryCalendar entries={entries} colorFor={colorFor} selectedId={selectedEntryId} onSelect={selectEntry} />
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
