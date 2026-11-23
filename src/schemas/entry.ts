import { z } from "zod";
import { objectIdSchema } from "./journal";

export const GeoPointSchema = z.object({
  type: z.literal("Point"),
  // GeoJSON order: [longitude, latitude]
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

export const ImageMetaSchema = z.object({
  url: z.url(),
  public_id: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  caption: z.string().max(200).optional(),
});

export const MOODS = ["happy", "excited", "calm", "grateful", "tired", "sad"] as const;
export const WEATHER = ["sunny", "cloudy", "rainy", "snowy", "windy", "stormy"] as const;

// Field rules shared by create and update, with no defaults. Defaults live only
// on the create schema; otherwise a partial update would reset fields it never sent.
const EntryFields = z.object({
  title: z.string().trim().min(1, "Title is required").max(140, "Title is too long"),
  journalId: objectIdSchema,
  content: z.string().max(20_000, "Entry is too long"),
  mood: z.enum(MOODS),
  weather: z.enum(WEATHER),
  location: GeoPointSchema,
  placeName: z.string().trim().max(120),
  images: z.array(ImageMetaSchema).max(10),
  isPublic: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
  entryDate: z.coerce.date(),
});

export const CreateEntrySchema = EntryFields.partial().extend({
  title: EntryFields.shape.title,
  journalId: EntryFields.shape.journalId,
  content: EntryFields.shape.content.default(""),
  isPublic: EntryFields.shape.isPublic.default(false),
  location: GeoPointSchema.nullable().optional(),
});

// null clears an optional field. The author never changes.
export const UpdateEntrySchema = EntryFields.partial().extend({
  mood: z.enum(MOODS).nullable().optional(),
  weather: z.enum(WEATHER).nullable().optional(),
  location: GeoPointSchema.nullable().optional(),
});

export type CreateEntryDTO = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryDTO = z.infer<typeof UpdateEntrySchema>;
