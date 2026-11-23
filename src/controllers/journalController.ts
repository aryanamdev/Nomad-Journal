// src/controllers/journalController.ts
import { NextResponse } from "next/server";
import { successResponse } from "@/lib/response";
import { handleError } from "@/lib/handleError";
import { journalService } from "@/services/journalService";
import { validateBody } from "@/lib/validate";
import { CreateJournalSchema, UpdateJournalSchema, objectIdSchema } from "@/schemas/journal";
import { withAuth } from "@/lib/withAuth";
import { BadRequestError } from "@/lib/errors";

function parseId(id: string | undefined) {
  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) throw new BadRequestError("Invalid journal id");
  return parsed.data;
}

// POST /api/v2/journal
export const createJournalController = withAuth(async (req, user) => {
  try {
    const payload = validateBody(CreateJournalSchema, await req.json());
    const journal = await journalService.create(user.id, payload);
    return NextResponse.json(successResponse(journal, "Journal created"), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
});

// GET /api/v2/journal
export const getJournalsController = withAuth(async (_req, user) => {
  try {
    const journals = await journalService.getAll(user.id);
    return NextResponse.json(successResponse(journals, "Journals fetched"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// GET /api/v2/journal/[id]
export const getJournalController = withAuth(async (_req, user, { params }) => {
  try {
    const journal = await journalService.getById(parseId(params.id), user.id);
    return NextResponse.json(successResponse(journal, "Journal fetched"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// PATCH /api/v2/journal/[id]
export const updateJournalController = withAuth(async (req, user, { params }) => {
  try {
    const id = parseId(params.id);
    const payload = validateBody(UpdateJournalSchema, await req.json());
    const journal = await journalService.update(id, user.id, payload);
    return NextResponse.json(successResponse(journal, "Journal updated"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});

// DELETE /api/v2/journal/[id]  (also deletes the journal's entries)
export const deleteJournalController = withAuth(async (_req, user, { params }) => {
  try {
    const journal = await journalService.remove(parseId(params.id), user.id);
    return NextResponse.json(successResponse(journal, "Journal deleted"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});
