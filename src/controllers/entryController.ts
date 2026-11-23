// src/controllers/entryController.ts
import { NextResponse } from "next/server";
import { successResponse } from "@/lib/response";
import { handleError } from "@/lib/handleError";
import { validateBody } from "@/lib/validate";
import { CreateEntrySchema, UpdateEntrySchema } from "@/schemas/entry";
import { objectIdSchema } from "@/schemas/journal";
import { withAuth } from "@/lib/withAuth";
import { entryService } from "@/services/entryService";
import { BadRequestError } from "@/lib/errors";

function parseId(id: string | undefined, label = "entry") {
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) throw new BadRequestError(`Invalid ${label} id`);
  return parsed.data;
}

// POST /api/v2/entries
export const createEntryController = withAuth(async (req, user) => {
  try {
    const payload = validateBody(CreateEntrySchema, await req.json());
    // The author always comes from the session, never from the request body.
    const created = await entryService.create(user.id, payload);
    return NextResponse.json(successResponse(created, "Entry created"), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});

// GET /api/v2/entries?journalId=...&q=...
export const getEntriesController = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const journalIdParam = searchParams.get("journalId");
    const journalId = journalIdParam ? parseId(journalIdParam, "journal") : undefined;
    const q = searchParams.get("q") ?? undefined;

    const entries = await entryService.getAll(user.id, { journalId, q });
    return NextResponse.json(successResponse(entries, "Entries fetched"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// GET /api/v2/entries/[id]
export const getEntryController = withAuth(async (_req, user, { params }) => {
  try {
    const entry = await entryService.getById(parseId(params.id), user.id);
    return NextResponse.json(successResponse(entry, "Entry fetched"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// PATCH /api/v2/entries/[id]
export const updateEntryController = withAuth(async (req, user, { params }) => {
  try {
    const id = parseId(params.id);
    const payload = validateBody(UpdateEntrySchema, await req.json());
    const updated = await entryService.update(id, user.id, payload);
    return NextResponse.json(successResponse(updated, "Entry updated"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// DELETE /api/v2/entries/[id]
export const deleteEntryController = withAuth(async (_req, user, { params }) => {
  try {
    const deleted = await entryService.remove(parseId(params.id), user.id);
    return NextResponse.json(successResponse(deleted, "Entry deleted"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});
