export interface User {
  _id: string;
  fullName: string;
  email: string;
  bio?: string;
  isVerified?: boolean;
  isDemo?: boolean;
  preferences?: { defaultView?: "list" | "map" | "calendar" };
  createdAt?: string;
}
