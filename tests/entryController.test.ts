import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, ctx, USER_ID, JOURNAL_ID, ENTRY_ID } from "./helpers";
import { NotFoundError } from "@/lib/errors";
import {
  createEntryController,
  getEntriesController,
  getEntryController,
  updateEntryController,
  deleteEntryController,
} from "@/controllers/entryController";
import { entryService } from "@/services/entryService";

vi.mock("@/services/entryService", () => ({
  entryService: { create: vi.fn(), getAll: vi.fn(), getById: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const svc = vi.mocked(entryService);
beforeEach(() => vi.clearAllMocks());

const valid = {
  title: "Nako lake",
  journalId: JOURNAL_ID,
  content: "Gold light on the peaks.",
  mood: "calm",
  weather: "windy",
  location: { type: "Point", coordinates: [78.63, 31.88] },
  tags: ["sunset"],
};

describe("entries API", () => {
  it("creates an entry with the session user as author", async () => {
    svc.create.mockResolvedValue({ _id: ENTRY_ID } as never);
    const res = await createEntryController(
      makeReq("/api/v2/entries", { method: "POST", body: { ...valid, authorId: "64b0000000000000000000ff" } }),
      ctx()
    );
    expect(res.status).toBe(201);
    const [authorId, payload] = svc.create.mock.calls[0];
    expect(authorId).toBe(USER_ID);
    expect(payload).not.toHaveProperty("authorId");
  });

  it("rejects bad moods, out-of-range coordinates and missing titles", async () => {
    for (const body of [
      { ...valid, mood: "furious" },
      { ...valid, location: { type: "Point", coordinates: [200, 10] } },
      { ...valid, title: "" },
      { ...valid, journalId: "nope" },
    ]) {
      const res = await createEntryController(makeReq("/api/v2/entries", { method: "POST", body }), ctx());
      expect(res.status).toBe(400);
    }
    expect(svc.create).not.toHaveBeenCalled();
  });

  it("returns 404 when writing into someone else's journal", async () => {
    svc.create.mockRejectedValue(new NotFoundError("Journal not found"));
    const res = await createEntryController(makeReq("/api/v2/entries", { method: "POST", body: valid }), ctx());
    expect(res.status).toBe(404);
  });

  it("passes journal and search filters to the service", async () => {
    svc.getAll.mockResolvedValue([] as never);
    const res = await getEntriesController(makeReq(`/api/v2/entries?journalId=${JOURNAL_ID}&q=lake`), ctx());
    expect(res.status).toBe(200);
    expect(svc.getAll).toHaveBeenCalledWith(USER_ID, { journalId: JOURNAL_ID, q: "lake" });
  });

  it("rejects a malformed journalId filter", async () => {
    const res = await getEntriesController(makeReq("/api/v2/entries?journalId=nope"), ctx());
    expect(res.status).toBe(400);
  });

  it("gets, updates and deletes by id", async () => {
    svc.getById.mockResolvedValue({ _id: ENTRY_ID } as never);
    svc.update.mockResolvedValue({ _id: ENTRY_ID } as never);
    svc.remove.mockResolvedValue({ _id: ENTRY_ID } as never);
    const params = ctx({ id: ENTRY_ID });

    expect((await getEntryController(makeReq(`/api/v2/entries/${ENTRY_ID}`), params)).status).toBe(200);
    expect(
      (await updateEntryController(makeReq(`/api/v2/entries/${ENTRY_ID}`, { method: "PATCH", body: { mood: null } }), params))
        .status
    ).toBe(200);
    // A partial update must only contain the fields that were sent.
    expect(svc.update).toHaveBeenCalledWith(ENTRY_ID, USER_ID, { mood: null });
    expect((await deleteEntryController(makeReq(`/api/v2/entries/${ENTRY_ID}`, { method: "DELETE" }), params)).status).toBe(200);
  });

  it("returns 404 for entries the user doesn't own", async () => {
    svc.getById.mockRejectedValue(new NotFoundError("Entry not found"));
    const res = await getEntryController(makeReq(`/api/v2/entries/${ENTRY_ID}`), ctx({ id: ENTRY_ID }));
    expect(res.status).toBe(404);
  });
});
