import { create } from "zustand";
import { api } from "@/lib/api";
import { ROUTES } from "@/app/constants/routes";
import type { User } from "@/types/user";
import type { Journal, JournalInput } from "@/types/journal";
import type { Entry, EntryInput } from "@/types/entry";

export type EntryView = "list" | "calendar" | "map";

/**
 * Shared dashboard state. Server data lives here so the three columns
 * (journals, entries, details) stay in sync; form state stays in components.
 */
export type JournalStoreState = {
  me: User | null;
  journals: Journal[];
  entries: Entry[];
  /** null means "All entries" across journals */
  selectedJournalId: string | null;
  selectedEntryId: string | null;
  view: EntryView;
  search: string;
  loading: { boot: boolean; entries: boolean };

  boot: () => Promise<void>;
  selectJournal: (id: string | null) => void;
  selectEntry: (id: string | null) => void;
  setView: (view: EntryView) => void;
  setSearch: (q: string) => void;
  loadEntries: () => Promise<void>;

  createJournal: (input: JournalInput) => Promise<Journal>;
  updateJournal: (id: string, input: Partial<JournalInput>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;

  createEntry: (input: EntryInput) => Promise<Entry>;
  updateEntry: (id: string, input: Partial<EntryInput>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  reset: () => void;
};

const initialState = {
  me: null,
  journals: [],
  entries: [],
  selectedJournalId: null,
  selectedEntryId: null,
  view: "list" as EntryView,
  search: "",
  loading: { boot: true, entries: false },
};

let entriesRequest = 0;

function adjustCount(journals: Journal[], journalId: string, delta: number) {
  return journals.map((j) => (j._id === journalId ? { ...j, entryCount: Math.max(0, (j.entryCount ?? 0) + delta) } : j));
}

function sortEntries(entries: Entry[]) {
  return [...entries].sort((a, b) => +new Date(b.entryDate) - +new Date(a.entryDate));
}

export const useJournalStore = create<JournalStoreState>((set, get) => ({
  ...initialState,

  async boot() {
    set({ loading: { ...get().loading, boot: true } });
    try {
      const [me, journals] = await Promise.all([
        api.get<User>(ROUTES.USER.VIEWER),
        api.get<Journal[]>(ROUTES.JOURNALS),
      ]);
      set({ me, journals, view: me.preferences?.defaultView ?? "list" });
      await get().loadEntries();
    } finally {
      set({ loading: { ...get().loading, boot: false } });
    }
  },

  selectJournal(id) {
    set({ selectedJournalId: id, selectedEntryId: null });
    void get().loadEntries();
  },

  selectEntry(id) {
    set({ selectedEntryId: id });
  },

  setView(view) {
    set({ view });
    // Remember the choice; failures here aren't worth bothering anyone about.
    api.patch(ROUTES.USER.VIEWER, { preferences: { defaultView: view } }).catch(() => {});
  },

  setSearch(search) {
    if (search === get().search) return;
    set({ search });
    void get().loadEntries();
  },

  async loadEntries() {
    const { selectedJournalId, search } = get();
    const params = new URLSearchParams();
    if (selectedJournalId) params.set("journalId", selectedJournalId);
    if (search.trim()) params.set("q", search.trim());

    const requestId = ++entriesRequest;
    set({ loading: { ...get().loading, entries: true } });
    try {
      const entries = await api.get<Entry[]>(`${ROUTES.ENTRIES}?${params}`);
      // Ignore responses that arrive after a newer request was made.
      if (requestId === entriesRequest) set({ entries });
    } finally {
      if (requestId === entriesRequest) set({ loading: { ...get().loading, entries: false } });
    }
  },

  async createJournal(input) {
    const journal = await api.post<Journal>(ROUTES.JOURNALS, input);
    set({ journals: [journal, ...get().journals] });
    get().selectJournal(journal._id);
    return journal;
  },

  async updateJournal(id, input) {
    const updated = await api.patch<Journal>(`${ROUTES.JOURNALS}/${id}`, input);
    set({ journals: get().journals.map((j) => (j._id === id ? { ...j, ...updated, entryCount: j.entryCount } : j)) });
  },

  async deleteJournal(id) {
    await api.delete(`${ROUTES.JOURNALS}/${id}`);
    set({ journals: get().journals.filter((j) => j._id !== id) });
    get().selectJournal(null);
  },

  async createEntry(input) {
    const entry = await api.post<Entry>(ROUTES.ENTRIES, input);
    const { selectedJournalId, entries, journals } = get();
    const visible = !selectedJournalId || selectedJournalId === entry.journalId;
    set({
      journals: adjustCount(journals, entry.journalId, 1),
      entries: visible ? sortEntries([entry, ...entries]) : entries,
      selectedEntryId: visible ? entry._id : null,
    });
    return entry;
  },

  async updateEntry(id, input) {
    const before = get().entries.find((e) => e._id === id);
    const updated = await api.patch<Entry>(`${ROUTES.ENTRIES}/${id}`, input);
    let journals = get().journals;
    if (before && before.journalId !== updated.journalId) {
      journals = adjustCount(adjustCount(journals, before.journalId, -1), updated.journalId, 1);
    }
    const { selectedJournalId } = get();
    const stillVisible = !selectedJournalId || selectedJournalId === updated.journalId;
    set({
      journals,
      entries: stillVisible
        ? sortEntries(get().entries.map((e) => (e._id === id ? updated : e)))
        : get().entries.filter((e) => e._id !== id),
      selectedEntryId: stillVisible ? id : null,
    });
  },

  async deleteEntry(id) {
    const entry = get().entries.find((e) => e._id === id);
    await api.delete(`${ROUTES.ENTRIES}/${id}`);
    set({
      entries: get().entries.filter((e) => e._id !== id),
      journals: entry ? adjustCount(get().journals, entry.journalId, -1) : get().journals,
      selectedEntryId: get().selectedEntryId === id ? null : get().selectedEntryId,
    });
  },

  reset: () => set(initialState),
}));
