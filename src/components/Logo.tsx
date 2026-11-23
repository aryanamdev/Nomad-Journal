import { cn } from "@/lib/utils";

/** Wordmark: condensed map lettering with a small dashed-route glyph. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden className="shrink-0">
        <path d="M3 18 C 7 18, 7 8, 11 8 S 15 4, 19 4" fill="none" stroke="var(--pen)" strokeWidth="2" strokeDasharray="2.5 2.5" strokeLinecap="round" />
        <circle cx="3" cy="18" r="2.4" fill="var(--ink)" />
        <circle cx="19" cy="4" r="2.4" fill="var(--pen)" />
      </svg>
      <span className="font-display text-[1.35rem] leading-none">Nomad Journal</span>
    </span>
  );
}
