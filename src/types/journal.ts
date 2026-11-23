export interface Journal {
  _id: string;
  title: string;
  description?: string;
  color?: string;
  coverImage?: string;
  isShared?: boolean;
  createdBy: string;
  entryCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type JournalInput = Pick<Journal, "title" | "description" | "color">;
