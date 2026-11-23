import mongoose, { Schema, Document } from "mongoose";

export interface ImageMeta {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IEntry extends Document {
  title: string;
  journalId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  mood?: string;
  weather?: string;
  location?: GeoPoint | null;
  placeName?: string;
  entryDate: Date;
  images: ImageMeta[];
  isPublic: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<ImageMeta>({
  url: { type: String, required: true },
  public_id: String,
  width: Number,
  height: Number,
  caption: String,
});

const EntrySchema = new Schema<IEntry>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    journalId: { type: Schema.Types.ObjectId, ref: "Journal", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    mood: String,
    weather: String,
    // Optional GeoJSON point. No defaults here: a half-filled point without
    // coordinates would break the 2dsphere index on insert.
    location: {
      type: new Schema(
        {
          type: { type: String, enum: ["Point"], required: true },
          coordinates: {
            type: [Number],
            required: true,
            validate: (v: number[]) => Array.isArray(v) && v.length === 2,
          },
        },
        { _id: false }
      ),
      default: undefined,
    },
    placeName: { type: String, trim: true, maxlength: 120 },
    // The day the entry is about (defaults to when it was written).
    entryDate: { type: Date, default: Date.now },
    images: { type: [ImageSchema], default: [] },
    isPublic: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

EntrySchema.index({ location: "2dsphere" }, { sparse: true });
EntrySchema.index({ authorId: 1, journalId: 1, entryDate: -1 });

const Entry = mongoose.models.Entry || mongoose.model<IEntry>("Entry", EntrySchema);
export default Entry
