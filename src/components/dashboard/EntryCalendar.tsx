"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sameDay } from "@/lib/entryMeta";
import type { Entry } from "@/types/entry";

type Props = {
  entries: Entry[];
  colorFor: (entry: Entry) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function EntryCalendar({ entries, colorFor, selectedId, onSelect }: Props) {
  // Open on the month of the most recent entry, or today.
  const latest = entries[0] ? new Date(entries[0].entryDate) : new Date();
  const [month, setMonth] = useState(new Date(latest.getFullYear(), latest.getMonth(), 1));

  const latestKey = entries[0]?.entryDate;
  useEffect(() => {
    if (latestKey) {
      const d = new Date(latestKey);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [latestKey]);

  const days = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // Monday-first grid
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const today = new Date();
  const shift = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-3xl">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="bg-page grid grid-cols-7 overflow-hidden rounded-lg border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="font-caption text-muted-foreground border-b py-2 text-center text-sm">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dayEntries = entries.filter((e) => sameDay(new Date(e.entryDate), day));
          const inMonth = day.getMonth() === month.getMonth();
          return (
            <div
              key={i}
              className={cn(
                "min-h-24 border-b border-l p-1.5 [&:nth-child(7n+8)]:border-l-0",
                !inMonth && "bg-paper/60 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "font-caption mb-1 grid size-6 place-items-center rounded-full text-sm tabular-nums",
                  sameDay(day, today) && "bg-pen text-white"
                )}
              >
                {day.getDate()}
              </div>
              <div className="grid gap-0.5">
                {dayEntries.map((e) => (
                  <button
                    key={e._id}
                    onClick={() => onSelect(e._id)}
                    title={e.title}
                    className={cn(
                      "truncate rounded-[3px] px-1.5 py-0.5 text-left text-xs leading-tight font-medium text-white",
                      e._id === selectedId && "ring-pen ring-2 ring-offset-1"
                    )}
                    style={{ background: colorFor(e) }}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
