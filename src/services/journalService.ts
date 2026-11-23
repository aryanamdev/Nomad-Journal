// src/services/journalService.ts
import mongoose from "mongoose";
import { connect } from "@/dbConfig/dbConfig";
import Journal from "@/models/journalModel";
import Entry from "@/models/entryModel";
import { CreateJournalDTO, UpdateJournalDTO } from "@/schemas/journal";
import { NotFoundError } from "@/lib/errors";

export const journalService = {
  async create(userId: string, data: CreateJournalDTO) {
    await connect();
    const journal = await Journal.create({ ...data, createdBy: userId });
    return { ...journal.toObject(), entryCount: 0 };
  },

  /** All of a user's journals, newest first, each with its entry count. */
  async getAll(userId: string) {
    await connect();
    const owner = new mongoose.Types.ObjectId(userId);
    const [journals, counts] = await Promise.all([
      Journal.find({ createdBy: owner }).sort({ createdAt: -1 }).lean(),
      Entry.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
        { $match: { authorId: owner } },
        { $group: { _id: "$journalId", count: { $sum: 1 } } },
      ]),
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.count]));
    return journals.map((j) => ({ ...j, entryCount: countById.get(String(j._id)) ?? 0 }));
  },

  async getById(id: string, userId: string) {
    await connect();
    const journal = await Journal.findOne({ _id: id, createdBy: userId }).lean();
    if (!journal) throw new NotFoundError("Journal not found");
    const entryCount = await Entry.countDocuments({ journalId: id, authorId: userId });
    return { ...journal, entryCount };
  },

  /** Throws unless the journal exists and belongs to the user. */
  async assertOwner(id: string, userId: string) {
    await connect();
    const exists = await Journal.exists({ _id: id, createdBy: userId });
    if (!exists) throw new NotFoundError("Journal not found");
  },

  async update(id: string, userId: string, data: UpdateJournalDTO) {
    await connect();
    const updatedJournal = await Journal.findOneAndUpdate({ _id: id, createdBy: userId }, data, {
      new: true,
      runValidators: true,
      lean: true,
    });
    if (!updatedJournal) throw new NotFoundError("Journal not found");
    return updatedJournal;
  },

  /** Deletes the journal and every entry in it. */
  async remove(id: string, userId: string) {
    await connect();
    const deleted = await Journal.findOneAndDelete({ _id: id, createdBy: userId }).lean();
    if (!deleted) throw new NotFoundError("Journal not found");
    const { deletedCount } = await Entry.deleteMany({ journalId: id, authorId: userId });
    return { ...deleted, deletedEntries: deletedCount };
  },
};
