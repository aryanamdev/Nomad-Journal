import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "@/models/userModel";

const ONE_DAY = 24 * 60 * 60 * 1000;

export interface SendEmailProps {
  email: string;
  emailType: "VERIFY" | "FORGOT";
  userId: string;
}

/**
 * Email is optional. Without SMTP settings (e.g. a local setup or a demo
 * deployment), new accounts are verified automatically instead.
 */
export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function appUrl() {
  return (process.env.DOMAIN || "http://localhost:3000").replace(/\/$/, "");
}

export const sendEmail = async ({ email, emailType, userId }: SendEmailProps) => {
  // URL-safe random token (a bcrypt hash contains "/" and "$", which break links).
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + ONE_DAY);

  await User.findByIdAndUpdate(
    userId,
    emailType === "VERIFY"
      ? { verifyToken: token, verifyTokenExpiryDate: expiry }
      : { forgotPasswordToken: token, forgotPasswordTokenExpiryDate: expiry }
  );

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const link = `${appUrl()}/verifyEmail?token=${token}`;
  const action = emailType === "VERIFY" ? "verify your email" : "reset your password";

  return transport.sendMail({
    from: process.env.EMAIL_FROM || `Nomad Journal <${process.env.SMTP_USER}>`,
    to: email,
    subject: emailType === "VERIFY" ? "Verify your Nomad Journal account" : "Reset your password",
    text: `Open this link to ${action}: ${link}\n\nThe link expires in 24 hours.`,
    html: `<p>Click <a href="${link}">here</a> to ${action}.</p><p>The link expires in 24 hours.</p>`,
  });
};
