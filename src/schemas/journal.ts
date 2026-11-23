import { z } from "zod";

// Common ObjectId validator (24-char hex)
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #3b82f6");

export const JournalSchema = z.object({
  _id: objectIdSchema.optional(),
  title: z.string().trim().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  color: hexColor.optional(),
  coverImage: z.union([z.url("Invalid URL format"), z.literal("")]).optional(),
  isShared: z.boolean().optional(),
  createdBy: objectIdSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateJournalSchema = JournalSchema.omit({
  _id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateJournalSchema = CreateJournalSchema.partial();

export type JournalDTO = z.infer<typeof JournalSchema>;
export type CreateJournalDTO = z.infer<typeof CreateJournalSchema>;
export type UpdateJournalDTO = z.infer<typeof UpdateJournalSchema>;
