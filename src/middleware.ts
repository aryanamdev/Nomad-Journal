import { NextResponse, NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/profile"];

/**
 * Edge middleware only checks that a session cookie exists, to route people
 * to the right page quickly. Every API route still verifies the JWT itself.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get("token")?.value);

  if (AUTH_PAGES.includes(path) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/register"],
};
