// src/services/entryService.ts
import { connect } from "@/dbConfig/dbConfig";
import Entry from "@/models/entryModel";
import { NotFoundError } from "@/lib/errors";
import { CreateEntryDTO, UpdateEntryDTO } from "@/schemas/entry";
import { journalService } from "./journalService";

export type EntryFilters = { journalId?: string; q?: string };

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const entryService = {
  async create(authorId: string, data: CreateEntryDTO) {
    // Entries can only be written into the author's own journals.
    await journalService.assertOwner(data.journalId, authorId);
    const entry = await Entry.create({ ...data, authorId });
    return entry.toObject();
  },

  async getAll(authorId: string, filters: EntryFilters = {}) {
    await connect();
    const query: Record<string, unknown> = { authorId };
    if (filters.journalId) query.journalId = filters.journalId;
    if (filters.q?.trim()) {
      const pattern = new RegExp(escapeRegex(filters.q.trim()), "i");
      query.$or = [{ title: pattern }, { content: pattern }, { tags: pattern }, { placeName: pattern }];
    }
    return Entry.find(query).sort({ entryDate: -1, createdAt: -1 }).lean();
  },

  async getById(id: string, authorId: string) {
    await connect();
    const entry = await Entry.findOne({ _id: id, authorId }).lean();
    if (!entry) throw new NotFoundError("Entry not found");
    return entry;
  },

  async update(id: string, authorId: string, data: UpdateEntryDTO) {
    if (data.journalId) await journalService.assertOwner(data.journalId, authorId);
    await connect();

    // null clears an optional field instead of storing null.
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, ""> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      if (value === null) $unset[key] = "";
      else $set[key] = value;
    }

    const updatedEntry = await Entry.findOneAndUpdate(
      { _id: id, authorId },
      { ...(Object.keys($set).length && { $set }), ...(Object.keys($unset).length && { $unset }) },
      { new: true, runValidators: true, lean: true }
    );
    if (!updatedEntry) throw new NotFoundError("Entry not found");
    return updatedEntry;
  },

  async remove(id: string, authorId: string) {
    await connect();
    const deleted = await Entry.findOneAndDelete({ _id: id, authorId }).lean();
    if (!deleted) throw new NotFoundError("Entry not found");
    return deleted;
  },
};
