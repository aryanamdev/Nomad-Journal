// src/lib/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyToken, TokenPayload } from "./jwt";
import { errorResponse } from "./response";

export type AuthUser = TokenPayload;

/**
 * Next.js 15 passes dynamic route params as a Promise. Handlers receive them
 * already resolved so they can read `params.id` directly.
 */
type IncomingContext = { params: Promise<Record<string, string>> };
export type RouteContext = { params: Record<string, string> };

type Handler = (req: NextRequest, user: AuthUser, context: RouteContext) => Promise<Response>;

export function withAuth(handler: Handler) {
  return async (req: NextRequest, context: IncomingContext) => {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    let user: AuthUser;
    try {
      user = verifyToken(token);
    } catch {
      return NextResponse.json(errorResponse("Session expired. Please log in again"), { status: 401 });
    }

    try {
      const params = (await context?.params) ?? {};
      return await handler(req, user, { params });
    } catch (err) {
      console.error(err);
      return NextResponse.json(errorResponse("Internal Server Error"), { status: 500 });
    }
  };
}
