"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { ROUTES } from "@/app/constants/routes";
import { useJournalStore } from "@/store/useJournalStore";
import { JournalDialog } from "./JournalDialog";

export function JournalSidebar() {
  const router = useRouter();
  const me = useJournalStore((s) => s.me);
  const journals = useJournalStore((s) => s.journals);
  const selectedJournalId = useJournalStore((s) => s.selectedJournalId);
  const selectJournal = useJournalStore((s) => s.selectJournal);
  const reset = useJournalStore((s) => s.reset);
  const [creating, setCreating] = useState(false);

  const total = journals.reduce((sum, j) => sum + (j.entryCount ?? 0), 0);

  const logout = async () => {
    await api.post(ROUTES.USER.LOGOUT).catch(() => {});
    reset();
    router.push("/");
  };

  const row = (active: boolean) =>
    cn(
      "group relative flex w-auto shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-[0.95rem] transition-colors lg:w-full lg:shrink",
      active ? "bg-page text-ink shadow-[0_1px_0_var(--border)]" : "text-ink/70 hover:bg-page/60 hover:text-ink"
    );

  return (
    <aside className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link href="/dashboard" aria-label="Nomad Journal home">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/profile" className="text-ink/70 hover:text-ink px-2 text-sm">
            Profile
          </Link>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
            <LogOut />
          </Button>
        </div>
      </div>

      <div className="flex items-baseline justify-between px-5 pb-1.5">
        <h2 className="font-caption text-muted-foreground text-sm">Your journals</h2>
        <button
          onClick={() => setCreating(true)}
          className="text-pen inline-flex items-center gap-1 text-sm font-medium hover:underline hover:underline-offset-4"
        >
          <Plus className="size-3.5" /> New journal
        </button>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto" aria-label="Journals">
        <button className={row(selectedJournalId === null)} onClick={() => selectJournal(null)} aria-current={selectedJournalId === null}>
          <span className="border-ink/50 size-3 shrink-0 rounded-[2px] border border-dashed" aria-hidden />
          <span className="truncate lg:flex-1">Every journal</span>
          <span className="font-caption text-muted-foreground text-sm tabular-nums">{total}</span>
        </button>
        {journals.map((j) => {
          const active = selectedJournalId === j._id;
          return (
            <button key={j._id} className={row(active)} onClick={() => selectJournal(j._id)} aria-current={active}>
              <span className="size-3 shrink-0 rounded-[2px]" style={{ background: j.color }} aria-hidden />
              <span className="max-w-44 truncate lg:max-w-none lg:flex-1">{j.title}</span>
              <span className="font-caption text-muted-foreground text-sm tabular-nums">{j.entryCount ?? 0}</span>
            </button>
          );
        })}
        {journals.length === 0 && (
          <p className="text-muted-foreground px-3 py-2 text-sm">No journals yet.</p>
        )}
      </nav>

      <div className="hidden items-center gap-2 border-t px-3 py-3 lg:flex">
        <Link href="/profile" className="hover:bg-page/60 flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5">
          <span className="bg-ink text-page font-display grid size-8 shrink-0 place-items-center rounded-full text-base">
            {me?.fullName?.[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{me?.fullName}</span>
            <span className="text-muted-foreground block truncate text-xs">{me?.isDemo ? "Demo account" : me?.email}</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut />
        </Button>
      </div>

      <JournalDialog open={creating} onOpenChange={setCreating} />
    </aside>
  );
}
