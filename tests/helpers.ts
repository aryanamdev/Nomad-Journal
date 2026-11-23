import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const TEST_SECRET = "test-secret";
process.env.JWT_SECRET = TEST_SECRET;

export const USER_ID = "64b000000000000000000001";
export const JOURNAL_ID = "64b0000000000000000000aa";
export const ENTRY_ID = "64b0000000000000000000ee";

export function sessionToken(overrides: Record<string, unknown> = {}) {
  return jwt.sign({ id: USER_ID, email: "a@test.com", fullName: "Test User", ...overrides }, TEST_SECRET);
}

type ReqOptions = { method?: string; body?: unknown; token?: string | null; rawBody?: string };

export function makeReq(url: string, { method = "GET", body, token = sessionToken(), rawBody }: ReqOptions = {}) {
  const headers: Record<string, string> = {};
  if (token) headers.cookie = `token=${token}`;
  if (body !== undefined || rawBody !== undefined) headers["content-type"] = "application/json";
  return new NextRequest(new URL(url, "http://localhost"), {
    method,
    headers,
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
}

/** Next.js 15 passes params as a Promise. */
export const ctx = (params: Record<string, string> = {}) => ({ params: Promise.resolve(params) });
