import { describe, it, expect, vi, beforeEach } from "vitest";
import { USER_ID, JOURNAL_ID, ENTRY_ID } from "./helpers";
import { NotFoundError } from "@/lib/errors";

vi.mock("@/dbConfig/dbConfig", () => ({ connect: vi.fn() }));
vi.mock("@/models/entryModel", () => ({
  default: { create: vi.fn(), find: vi.fn(), findOneAndUpdate: vi.fn(), findOne: vi.fn(), findOneAndDelete: vi.fn() },
}));
vi.mock("@/services/journalService", () => ({ journalService: { assertOwner: vi.fn() } }));

import Entry from "@/models/entryModel";
import { entryService } from "@/services/entryService";
import { journalService } from "@/services/journalService";

const EntryModel = Entry as unknown as Record<"create" | "find" | "findOneAndUpdate", ReturnType<typeof vi.fn>>;
beforeEach(() => vi.clearAllMocks());

describe("entryService", () => {
  it("refuses to create an entry in a journal the user doesn't own", async () => {
    vi.mocked(journalService.assertOwner).mockRejectedValue(new NotFoundError("Journal not found"));
    await expect(
      entryService.create(USER_ID, { title: "x", journalId: JOURNAL_ID, content: "", isPublic: false })
    ).rejects.toThrow("Journal not found");
    expect(EntryModel.create).not.toHaveBeenCalled();
  });

  it("clears fields sent as null and sets the rest", async () => {
    EntryModel.findOneAndUpdate.mockResolvedValue({ _id: ENTRY_ID } as never);
    await entryService.update(ENTRY_ID, USER_ID, { title: "New", mood: null, location: null });
    expect(EntryModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: ENTRY_ID, authorId: USER_ID },
      { $set: { title: "New" }, $unset: { mood: "", location: "" } },
      expect.anything()
    );
  });

  it("checks ownership of the target journal when moving an entry", async () => {
    vi.mocked(journalService.assertOwner).mockResolvedValue(undefined);
    EntryModel.findOneAndUpdate.mockResolvedValue({ _id: ENTRY_ID } as never);
    await entryService.update(ENTRY_ID, USER_ID, { journalId: JOURNAL_ID });
    expect(journalService.assertOwner).toHaveBeenCalledWith(JOURNAL_ID, USER_ID);
  });

  it("escapes search text so it can't inject a regex", async () => {
    const lean = vi.fn().mockResolvedValue([]);
    EntryModel.find.mockReturnValue({ sort: () => ({ lean }) } as never);
    await entryService.getAll(USER_ID, { q: "a.*(b" });
    const query = EntryModel.find.mock.calls[0][0] as { $or: { title: RegExp }[] };
    expect(query.$or[0].title.source).toBe("a\\.\\*\\(b");
  });
});
