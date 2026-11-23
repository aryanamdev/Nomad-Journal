"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, LogOut, Plus, UserRound } from "lucide-react";
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

  const item = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
      active ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
    );

  return (
    <aside className="bg-sidebar flex min-h-0 flex-col border-b lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 lg:hidden">
          <Button asChild variant="ghost" size="icon" aria-label="Profile">
            <Link href="/profile">
              <UserRound />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
            <LogOut />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Journals</span>
        <Button size="sm" variant="ghost" onClick={() => setCreating(true)} aria-label="New journal">
          <Plus /> New
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto" aria-label="Journals">
        <button className={cn(item(selectedJournalId === null), "shrink-0 lg:shrink")} onClick={() => selectJournal(null)}>
          <BookOpen className="size-4" />
          <span className="flex-1 truncate">All entries</span>
          <span className="text-muted-foreground text-xs tabular-nums">{total}</span>
        </button>
        {journals.map((j) => (
          <button
            key={j._id}
            className={cn(item(selectedJournalId === j._id), "shrink-0 lg:shrink")}
            onClick={() => selectJournal(j._id)}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: j.color }} />
            <span className="max-w-40 flex-1 truncate lg:max-w-none">{j.title}</span>
            <span className="text-muted-foreground text-xs tabular-nums">{j.entryCount ?? 0}</span>
          </button>
        ))}
        {journals.length === 0 && (
          <p className="text-muted-foreground px-3 py-2 text-sm">No journals yet. Create one to start writing.</p>
        )}
      </nav>

      <div className="hidden items-center gap-2 border-t p-3 lg:flex">
        <Link href="/profile" className="hover:bg-background/60 flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5">
          <span className="bg-primary/10 text-primary grid size-8 shrink-0 place-items-center rounded-full text-sm font-medium">
            {me?.fullName?.[0]?.toUpperCase() ?? <UserRound className="size-4" />}
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
