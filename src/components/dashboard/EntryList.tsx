"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOOD_META, WEATHER_META, formatDate } from "@/lib/entryMeta";
import type { Entry } from "@/types/entry";
import type { Journal } from "@/types/journal";

type Props = {
  entries: Entry[];
  journalsById: Map<string, Journal>;
  showJournal: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function EntryList({ entries, journalsById, showJournal, selectedId, onSelect }: Props) {
  // Group by month so long journals stay scannable.
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = formatDate(e.entryDate, { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }

  return (
    <div className="grid gap-6">
      {[...groups].map(([month, items]) => (
        <section key={month} className="grid gap-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{month}</h3>
          <ul className="grid gap-2">
            {items.map((e) => {
              const journal = journalsById.get(e.journalId);
              return (
                <li key={e._id}>
                  <button
                    onClick={() => onSelect(e._id)}
                    className={cn(
                      "bg-card w-full rounded-xl border p-4 text-left transition hover:shadow-sm",
                      e._id === selectedId ? "border-primary ring-primary/20 ring-2" : "hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.title}</p>
                        <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                          <span>{formatDate(e.entryDate, { weekday: "short", day: "numeric", month: "short" })}</span>
                          {e.placeName && (
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="size-3" />
                              {e.placeName}
                            </span>
                          )}
                          {showJournal && journal && (
                            <span className="inline-flex items-center gap-1">
                              <span className="size-2 rounded-full" style={{ background: journal.color }} />
                              {journal.title}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 text-base" aria-hidden>
                        {e.mood && MOOD_META[e.mood]?.emoji}
                        {e.weather && WEATHER_META[e.weather]?.emoji}
                      </span>
                    </div>
                    {e.content && <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{e.content}</p>}
                    {!!e.tags?.length && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {e.tags.map((t) => (
                          <span key={t} className="bg-secondary rounded-full px-2 py-0.5 text-[11px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
