export interface ImageMeta {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export type Mood = "happy" | "excited" | "calm" | "grateful" | "tired" | "sad";
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy" | "windy" | "stormy";

export interface Entry {
  _id: string;
  title: string;
  journalId: string;
  authorId: string;
  content: string;
  mood?: Mood;
  weather?: Weather;
  location?: GeoPoint | null;
  placeName?: string;
  entryDate: string;
  images?: ImageMeta[];
  isPublic?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type EntryInput = {
  title: string;
  journalId: string;
  content: string;
  mood?: Mood | null;
  weather?: Weather | null;
  location?: GeoPoint | null;
  placeName?: string;
  entryDate: string;
  tags?: string[];
};
