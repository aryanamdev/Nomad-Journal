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

/**
 * Entries drawn as stops along a dashed trail, newest first, with each month
 * as a waypoint. The trail is the one decorative device in the app.
 */
export function EntryList({ entries, journalsById, showJournal, selectedId, onSelect }: Props) {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = formatDate(e.entryDate, { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }

  return (
    <ol className="relative mx-auto max-w-3xl">
      {/* the trail */}
      <span
        aria-hidden
        className="absolute top-3 bottom-3 left-[5.25rem] w-0 border-l-2 border-dashed"
        style={{ borderColor: "color-mix(in srgb, var(--contour) 70%, transparent)" }}
      />

      {[...groups].map(([month, items]) => (
        <li key={month} className="relative">
          <h3 className="font-display text-ink/80 relative py-4 pl-[6.75rem] text-2xl">
            <span
              aria-hidden
              className="bg-paper border-ink absolute top-1/2 left-[5.25rem] size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2"
            />
            {month}
          </h3>

          <ol>
            {items.map((e) => {
              const journal = journalsById.get(e.journalId);
              const active = e._id === selectedId;
              const date = new Date(e.entryDate);
              const feel = [e.mood && MOOD_META[e.mood], e.weather && WEATHER_META[e.weather]].filter(Boolean) as {
                emoji: string;
                label: string;
              }[];

              return (
                <li key={e._id} className="relative">
                  <button
                    onClick={() => onSelect(e._id)}
                    aria-current={active}
                    className={cn(
                      "grid w-full grid-cols-[4.25rem_2rem_1fr] items-start rounded-lg py-4 pr-4 text-left transition-colors",
                      active ? "bg-page shadow-[0_1px_0_var(--border),0_0_0_1px_var(--border)]" : "hover:bg-page/55"
                    )}
                  >
                    <span className="pt-0.5 text-right">
                      <span className="font-display block text-[2rem] leading-none tabular-nums">{date.getDate()}</span>
                      <span className="font-caption text-muted-foreground block text-xs">
                        {date.toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </span>

                    <span className="relative flex justify-center pt-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          "rounded-full ring-[3px] transition-all",
                          active ? "ring-pen size-3.5" : "ring-paper size-3"
                        )}
                        style={{ background: journal?.color ?? "var(--contour)" }}
                      />
                    </span>

                    <span className="min-w-0 pl-2">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-ink text-lg leading-snug font-semibold">{e.title}</span>
                        {feel.length > 0 && (
                          <span className="shrink-0 pt-0.5 text-base" title={feel.map((f) => f.label).join(", ")}>
                            {feel.map((f) => f.emoji).join(" ")}
                          </span>
                        )}
                      </span>

                      <span className="font-caption text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 text-sm">
                        {e.placeName && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden />
                            {e.placeName}
                          </span>
                        )}
                        {showJournal && journal && <span style={{ color: journal.color }}>{journal.title}</span>}
                      </span>

                      {e.content && (
                        <span className="font-story text-ink/80 mt-2 line-clamp-2 block text-[0.98rem] leading-relaxed">
                          {e.content}
                        </span>
                      )}

                      {!!e.tags?.length && (
                        <span className="text-pen mt-2 flex flex-wrap gap-x-3 text-sm">
                          {e.tags.map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
