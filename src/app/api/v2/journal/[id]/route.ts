import {
  getJournalController,
  updateJournalController,
  deleteJournalController,
} from "@/controllers/journalController";

export const GET = getJournalController;
export const PATCH = updateJournalController;
export const DELETE = deleteJournalController;
