import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, ctx, USER_ID } from "./helpers";
import { BadRequestError, ForbiddenError, UnauthorizedError } from "@/lib/errors";
import {
  registerController,
  loginController,
  logoutController,
  verifyController,
  meController,
  demoLoginController,
  updateMeController,
} from "@/controllers/authController";
import { authService } from "@/services/authService";

vi.mock("@/services/authService", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    demoLogin: vi.fn(),
    verify: vi.fn(),
    me: vi.fn(),
    updateMe: vi.fn(),
  },
}));

const svc = vi.mocked(authService);

beforeEach(() => vi.clearAllMocks());

describe("registerController", () => {
  const body = { email: "a@test.com", fullName: "Test User", password: "password123" };

  it("returns 201 and tells the client whether email verification is needed", async () => {
    svc.register.mockResolvedValue({ user: { email: body.email } as never, requiresVerification: true });
    const res = await registerController(makeReq("/api/v2/users/register", { method: "POST", body, token: null }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.requiresVerification).toBe(true);
    expect(json.message).toMatch(/check your email/i);
  });

  it("rejects a short password before reaching the service", async () => {
    const res = await registerController(
      makeReq("/api/v2/users/register", { method: "POST", body: { ...body, password: "short" }, token: null })
    );
    expect(res.status).toBe(400);
    expect(svc.register).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await registerController(makeReq("/api/v2/users/register", { method: "POST", rawBody: "{nope", token: null }));
    expect(res.status).toBe(400);
  });

  it("maps a duplicate email to 400", async () => {
    svc.register.mockRejectedValue(new BadRequestError("An account with this email already exists"));
    const res = await registerController(makeReq("/api/v2/users/register", { method: "POST", body, token: null }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/already exists/);
  });
});

describe("loginController", () => {
  const body = { email: "a@test.com", password: "password123" };

  it("sets an httpOnly session cookie on success", async () => {
    svc.login.mockResolvedValue({ token: "jwt-token", user: { email: body.email } as never });
    const res = await loginController(makeReq("/api/v2/users/login", { method: "POST", body, token: null }));
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("token=jwt-token");
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("returns 401 for wrong credentials", async () => {
    svc.login.mockRejectedValue(new UnauthorizedError("Incorrect email or password"));
    const res = await loginController(makeReq("/api/v2/users/login", { method: "POST", body, token: null }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for unverified accounts", async () => {
    svc.login.mockRejectedValue(new ForbiddenError("Please verify your email before logging in"));
    const res = await loginController(makeReq("/api/v2/users/login", { method: "POST", body, token: null }));
    expect(res.status).toBe(403);
  });
});

describe("demoLoginController", () => {
  it("starts a session for the demo account", async () => {
    svc.demoLogin.mockResolvedValue({ token: "demo-token", user: { isDemo: true } as never });
    const res = await demoLoginController();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("token=demo-token");
  });
});

describe("logoutController", () => {
  it("clears the session cookie", async () => {
    const res = await logoutController();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/token=;.*Expires=Thu, 01 Jan 1970/);
  });
});

describe("verifyController", () => {
  const body = { token: "a".repeat(64) };

  it("reports an already verified account", async () => {
    svc.verify.mockResolvedValue({ alreadyVerified: true });
    const res = await verifyController(makeReq("/api/v2/users/verifyEmail", { method: "POST", body, token: null }));
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe("Email already verified");
  });

  it("confirms a newly verified account", async () => {
    svc.verify.mockResolvedValue({ alreadyVerified: false });
    const res = await verifyController(makeReq("/api/v2/users/verifyEmail", { method: "POST", body, token: null }));
    expect((await res.json()).message).toMatch(/verified/);
  });
});

describe("meController", () => {
  it("returns the current user", async () => {
    svc.me.mockResolvedValue({ success: true, user: { email: "a@test.com" } as never });
    const res = await meController(makeReq("/api/v2/users/me"));
    expect(res.status).toBe(200);
    expect((await res.json()).data.email).toBe("a@test.com");
  });

  it("returns 401 when the session is invalid", async () => {
    svc.me.mockRejectedValue(new UnauthorizedError("Invalid session"));
    const res = await meController(makeReq("/api/v2/users/me", { token: "bad" }));
    expect(res.status).toBe(401);
  });
});

describe("updateMeController", () => {
  it("updates the logged-in user's profile", async () => {
    svc.updateMe.mockResolvedValue({ fullName: "New Name" } as never);
    const res = await updateMeController(
      makeReq("/api/v2/users/me", { method: "PATCH", body: { fullName: "New Name" } }),
      ctx()
    );
    expect(res.status).toBe(200);
    expect(svc.updateMe).toHaveBeenCalledWith(USER_ID, { fullName: "New Name" });
  });

  it("rejects a bio over 200 characters", async () => {
    const res = await updateMeController(
      makeReq("/api/v2/users/me", { method: "PATCH", body: { bio: "x".repeat(201) } }),
      ctx()
    );
    expect(res.status).toBe(400);
  });

  it("requires a session", async () => {
    const res = await updateMeController(
      makeReq("/api/v2/users/me", { method: "PATCH", body: { bio: "hi" }, token: null }),
      ctx()
    );
    expect(res.status).toBe(401);
  });
});
