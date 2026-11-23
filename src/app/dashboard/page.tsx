"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { JournalSidebar } from "@/components/dashboard/JournalSidebar";
import { EntriesPanel } from "@/components/dashboard/EntriesPanel";
import { DetailPanel } from "@/components/dashboard/DetailPanel";
import { useJournalStore } from "@/store/useJournalStore";

export default function DashboardPage() {
  const boot = useJournalStore((s) => s.boot);
  const booting = useJournalStore((s) => s.loading.boot);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    boot().catch((err: Error) => setError(err.message));
  };

  useEffect(load, [boot]);

  if (error) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="grid gap-3">
          <Logo className="justify-center" />
          <p className="text-muted-foreground text-sm">We couldn&apos;t load your journals: {error}</p>
          <Button onClick={load}>Try again</Button>
        </div>
      </main>
    );
  }

  if (booting) {
    return (
      <main className="grid min-h-dvh place-items-center" aria-busy="true">
        <Logo className="animate-pulse" />
      </main>
    );
  }

  return (
    <main className="grid h-dvh grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_380px] lg:grid-rows-1">
      <JournalSidebar />
      <EntriesPanel />

      {/* Desktop: always-visible third column. Mobile: full-screen sheet when an entry is open. */}
      <aside className="hidden min-h-0 overflow-y-auto border-l p-6 lg:block" aria-label="Details">
        <DetailPanel />
      </aside>
      {selectedEntryId && (
        <div className="bg-background fixed inset-0 z-[900] overflow-y-auto p-4 lg:hidden" role="dialog" aria-label="Entry">
          <DetailPanel />
        </div>
      )}
    </main>
  );
}
