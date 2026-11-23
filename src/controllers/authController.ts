// src/controllers/authController.ts
import { NextRequest, NextResponse } from "next/server";
import { validateBody } from "@/lib/validate";
import { RegisterSchema, LoginSchema, VerifySchema, UpdateProfileSchema } from "@/schemas/auth";
import { authService } from "@/services/authService";
import { successResponse } from "@/lib/response";
import { handleError } from "@/lib/handleError";
import { withAuth } from "@/lib/withAuth";
import { AUTH_COOKIE, sessionCookieOptions } from "@/lib/jwt";

function withSession(res: NextResponse, token: string) {
  res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
  return res;
}

export const registerController = async (req: NextRequest) => {
  try {
    const payload = validateBody(RegisterSchema, await req.json());
    const { user, requiresVerification } = await authService.register(payload);
    const message = requiresVerification
      ? "Account created. Check your email to verify it, then log in."
      : "Account created. You can log in now.";
    return NextResponse.json(successResponse({ user, requiresVerification }, message), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
};

export const loginController = async (req: NextRequest) => {
  try {
    const payload = validateBody(LoginSchema, await req.json());
    const { token, user } = await authService.login(payload);
    return withSession(NextResponse.json(successResponse(user, "Login successful"), { status: 200 }), token);
  } catch (err) {
    return handleError(err);
  }
};

export const demoLoginController = async () => {
  try {
    const { token, user } = await authService.demoLogin();
    return withSession(NextResponse.json(successResponse(user, "Welcome to the demo"), { status: 200 }), token);
  } catch (err) {
    return handleError(err);
  }
};

export const logoutController = async () => {
  const res = NextResponse.json(successResponse(null, "Logged out successfully"), { status: 200 });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
  return res;
};

export const verifyController = async (req: NextRequest) => {
  try {
    const payload = validateBody(VerifySchema, await req.json());
    const result = await authService.verify(payload);
    const message = result.alreadyVerified ? "Email already verified" : "Email verified. You can log in now.";
    return NextResponse.json(successResponse(null, message), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
};

export const meController = async (req: NextRequest) => {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value || "";
    const me = await authService.me({ token });
    return NextResponse.json(successResponse(me?.user, "User fetched"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
};

export const updateMeController = withAuth(async (req, user) => {
  try {
    const payload = validateBody(UpdateProfileSchema, await req.json());
    const updated = await authService.updateMe(user.id, payload);
    return NextResponse.json(successResponse(updated, "Profile updated"), { status: 200 });
  } catch (err) {
    return handleError(err);
  }
});
