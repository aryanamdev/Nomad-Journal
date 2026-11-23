import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email("Invalid email"),
  fullName: z.string().trim().min(2, "Full name too short").max(50, "Full name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const VerifySchema = z.object({
  token: z.string().min(10, "Invalid token"),
});

export const TokenSchema = VerifySchema;

export const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name too short").max(50, "Full name too long").optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  preferences: z
    .object({ defaultView: z.enum(["list", "map", "calendar"]).optional() })
    .optional(),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ViewerDTO = z.infer<typeof TokenSchema>;
export type VerifyDTO = z.infer<typeof VerifySchema>;
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
