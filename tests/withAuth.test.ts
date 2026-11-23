import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { makeReq, ctx, sessionToken, USER_ID } from "./helpers";
import { withAuth } from "@/lib/withAuth";

const ok = vi.fn(async (_req, user, context) => NextResponse.json({ user, params: context.params }));

describe("withAuth", () => {
  it("rejects requests without a session cookie", async () => {
    const res = await withAuth(ok)(makeReq("/api/x", { token: null }), ctx());
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects a token signed with another secret", async () => {
    const forged = jwt.sign({ id: USER_ID, email: "a@test.com" }, "not-the-secret");
    const res = await withAuth(ok)(makeReq("/api/x", { token: forged }), ctx());
    expect(res.status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const expired = sessionToken({ exp: Math.floor(Date.now() / 1000) - 60 });
    const res = await withAuth(ok)(makeReq("/api/x", { token: expired }), ctx());
    expect(res.status).toBe(401);
  });

  it("passes the user and resolved route params to the handler", async () => {
    const res = await withAuth(ok)(makeReq("/api/x"), ctx({ id: "abc" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user.id).toBe(USER_ID);
    expect(json.params).toEqual({ id: "abc" });
  });

  it("turns unexpected handler errors into a 500", async () => {
    const boom = withAuth(async () => {
      throw new Error("boom");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await boom(makeReq("/api/x"), ctx());
    expect(res.status).toBe(500);
  });
});
