import jwt, { JwtPayload } from "jsonwebtoken";

export type TokenPayload = { id: string; email: string; fullName: string };

export const AUTH_COOKIE = "token";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, in seconds

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to your environment variables.");
  }
  return secret;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_MAX_AGE });
}

/** Returns the decoded payload, or throws the underlying jsonwebtoken error. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & Partial<TokenPayload>;
  if (!decoded?.id || !decoded?.email) {
    throw new Error("Malformed token payload");
  }
  return { id: String(decoded.id), email: decoded.email, fullName: decoded.fullName ?? "" };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
