// src/services/authService.ts
import bcrypt from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError } from "@/lib/errors";
import { RegisterDTO, LoginDTO, VerifyDTO, ViewerDTO, UpdateProfileDTO } from "@/schemas/auth";
import { signToken, verifyToken, sessionCookieOptions } from "@/lib/jwt";
import { isEmailConfigured, sendEmail } from "@/helpers/verifyEmail";
import { demoService, DEMO_EMAIL } from "./demoService";

const SAFE_FIELDS = "-password -verifyToken -verifyTokenExpiryDate -forgotPasswordToken -forgotPasswordTokenExpiryDate";

function issueSession(user: { _id: unknown; email: string; fullName: string }) {
  return signToken({ id: String(user._id), email: user.email, fullName: user.fullName });
}

export const authService = {
  async register(payload: RegisterDTO) {
    await connect();
    const email = payload.email.toLowerCase();
    if (email === DEMO_EMAIL) throw new BadRequestError("This email is reserved");

    const existing = await User.findOne({ email }).lean();
    if (existing) throw new BadRequestError("An account with this email already exists");

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const emailEnabled = isEmailConfigured();

    const savedUser = await User.create({
      email,
      fullName: payload.fullName,
      password: hashedPassword,
      isVerified: !emailEnabled,
    });

    if (emailEnabled) {
      await sendEmail({ email, emailType: "VERIFY", userId: String(savedUser._id) });
    }

    const user = await User.findById(savedUser._id).select(SAFE_FIELDS).lean();
    return { user, requiresVerification: emailEnabled };
  },

  async login(payload: LoginDTO) {
    await connect();
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    // Same message for unknown email and wrong password, so accounts can't be probed.
    if (!user) throw new UnauthorizedError("Incorrect email or password");

    const match = await bcrypt.compare(payload.password, user.password);
    if (!match) throw new UnauthorizedError("Incorrect email or password");

    if (!user.isVerified) throw new ForbiddenError("Please verify your email before logging in");

    const safeUser = await User.findById(user._id).select(SAFE_FIELDS).lean();
    return { token: issueSession(user), user: safeUser };
  },

  async demoLogin() {
    await connect();
    const user = await demoService.ensureDemoUser();
    const safeUser = await User.findById(user._id).select(SAFE_FIELDS).lean();
    return { token: issueSession(user), user: safeUser };
  },

  async logout() {
    // Sessions are stateless JWTs; the controller clears the cookie.
    return true;
  },

  async verify({ token }: VerifyDTO) {
    await connect();
    const user = await User.findOne({ verifyToken: token });
    if (!user) throw new NotFoundError("This verification link is invalid or has already been used");

    if (user.isVerified) return { alreadyVerified: true };

    if (user.verifyTokenExpiryDate && user.verifyTokenExpiryDate < new Date()) {
      throw new BadRequestError("This verification link has expired");
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiryDate = undefined;
    await user.save();

    return { alreadyVerified: false };
  },

  async me({ token }: ViewerDTO) {
    if (!token) throw new UnauthorizedError("Not logged in");

    let userId: string;
    try {
      userId = verifyToken(token).id;
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "TokenExpiredError") {
        throw new UnauthorizedError("Session expired. Please log in again");
      }
      throw new UnauthorizedError("Invalid session");
    }

    await connect();
    const user = await User.findById(userId).select(SAFE_FIELDS).lean();
    if (!user) throw new UnauthorizedError("User no longer exists");

    return { success: true, user };
  },

  async updateMe(userId: string, data: UpdateProfileDTO) {
    await connect();
    const current = await User.findById(userId).select("isDemo").lean<{ isDemo?: boolean }>();
    if (!current) throw new NotFoundError("User not found");
    if (current.isDemo && (data.fullName !== undefined || data.bio !== undefined)) {
      throw new ForbiddenError("The demo profile can't be edited. Create a free account to try this.");
    }

    const update: Record<string, unknown> = {};
    if (data.fullName !== undefined) update.fullName = data.fullName;
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.preferences?.defaultView) update["preferences.defaultView"] = data.preferences.defaultView;

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true })
      .select(SAFE_FIELDS)
      .lean();
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  cookieOptions: sessionCookieOptions,
};
