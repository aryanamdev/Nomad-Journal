import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, ctx, USER_ID, JOURNAL_ID } from "./helpers";
import { NotFoundError } from "@/lib/errors";
import {
  createJournalController,
  getJournalsController,
  getJournalController,
  updateJournalController,
  deleteJournalController,
} from "@/controllers/journalController";
import { journalService } from "@/services/journalService";

vi.mock("@/services/journalService", () => ({
  journalService: { create: vi.fn(), getAll: vi.fn(), getById: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const svc = vi.mocked(journalService);
beforeEach(() => vi.clearAllMocks());

describe("journal API", () => {
  it("creates a journal for the logged-in user", async () => {
    svc.create.mockResolvedValue({ _id: JOURNAL_ID, title: "Japan" } as never);
    const res = await createJournalController(
      makeReq("/api/v2/journal", { method: "POST", body: { title: "Japan", color: "#0ea5e9" } }),
      ctx()
    );
    expect(res.status).toBe(201);
    expect(svc.create).toHaveBeenCalledWith(USER_ID, { title: "Japan", color: "#0ea5e9" });
  });

  it("ignores a createdBy sent by the client", async () => {
    svc.create.mockResolvedValue({} as never);
    await createJournalController(
      makeReq("/api/v2/journal", { method: "POST", body: { title: "Japan", createdBy: "64b0000000000000000000ff" } }),
      ctx()
    );
    expect(svc.create).toHaveBeenCalledWith(USER_ID, { title: "Japan" });
  });

  it("rejects an empty title and an invalid color", async () => {
    const empty = await createJournalController(makeReq("/api/v2/journal", { method: "POST", body: { title: " " } }), ctx());
    const badColor = await createJournalController(
      makeReq("/api/v2/journal", { method: "POST", body: { title: "Japan", color: "red" } }),
      ctx()
    );
    expect(empty.status).toBe(400);
    expect(badColor.status).toBe(400);
    expect(svc.create).not.toHaveBeenCalled();
  });

  it("lists the user's journals", async () => {
    svc.getAll.mockResolvedValue([{ _id: JOURNAL_ID, entryCount: 3 }] as never);
    const res = await getJournalsController(makeReq("/api/v2/journal"), ctx());
    expect(res.status).toBe(200);
    expect((await res.json()).data[0].entryCount).toBe(3);
    expect(svc.getAll).toHaveBeenCalledWith(USER_ID);
  });

  it("fetches one journal by id", async () => {
    svc.getById.mockResolvedValue({ _id: JOURNAL_ID } as never);
    const res = await getJournalController(makeReq(`/api/v2/journal/${JOURNAL_ID}`), ctx({ id: JOURNAL_ID }));
    expect(res.status).toBe(200);
    expect(svc.getById).toHaveBeenCalledWith(JOURNAL_ID, USER_ID);
  });

  it("returns 400 for a malformed id instead of querying", async () => {
    const res = await getJournalController(makeReq("/api/v2/journal/nope"), ctx({ id: "nope" }));
    expect(res.status).toBe(400);
    expect(svc.getById).not.toHaveBeenCalled();
  });

  it("validates updates", async () => {
    svc.update.mockResolvedValue({ _id: JOURNAL_ID, title: "Renamed" } as never);
    const ok = await updateJournalController(
      makeReq(`/api/v2/journal/${JOURNAL_ID}`, { method: "PATCH", body: { title: "Renamed" } }),
      ctx({ id: JOURNAL_ID })
    );
    const bad = await updateJournalController(
      makeReq(`/api/v2/journal/${JOURNAL_ID}`, { method: "PATCH", body: { title: "x".repeat(101) } }),
      ctx({ id: JOURNAL_ID })
    );
    expect(ok.status).toBe(200);
    expect(bad.status).toBe(400);
  });

  it("returns 404 when the journal belongs to someone else", async () => {
    svc.remove.mockRejectedValue(new NotFoundError("Journal not found"));
    const res = await deleteJournalController(
      makeReq(`/api/v2/journal/${JOURNAL_ID}`, { method: "DELETE" }),
      ctx({ id: JOURNAL_ID })
    );
    expect(res.status).toBe(404);
  });

  it("requires a session", async () => {
    const res = await getJournalsController(makeReq("/api/v2/journal", { token: null }), ctx());
    expect(res.status).toBe(401);
    expect(svc.getAll).not.toHaveBeenCalled();
  });
});
