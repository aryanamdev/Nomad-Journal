import { getEntryController, updateEntryController, deleteEntryController } from "@/controllers/entryController";

export const GET = getEntryController;
export const PATCH = updateEntryController;
export const DELETE = deleteEntryController;
