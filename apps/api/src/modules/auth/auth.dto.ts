import { z } from "zod";

/**
 * Normalizes any Bangladeshi phone format into the E.164 standard: +8801XXXXXXXXX
 *
 * Supported inputs:
 * - 01712345678 (Standard local 11-digit)
 * - 8801712345678 (Country code without plus)
 * - +8801712345678 (Full E.164 with plus)
 * - 008801712345678 (International dialing prefix)
 * - Formatting with spaces or dashes: "01712-345678", "+88 01712 345678"
 */
export function normalizeBdPhoneNumber(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== "string") {
    throw new Error("Phone number must be a non-empty string");
  }

  // 1. Remove all spaces, hyphens, and parentheses
  let cleaned = rawPhone.trim().replace(/[\s\-().]/g, "");

  // 2. Handle international double zero prefix (00880...)
  if (cleaned.startsWith("00880")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // 3. Handle numbers with country code without plus (880...)
  if (cleaned.startsWith("880")) {
    cleaned = "+" + cleaned;
  }

  // 4. Handle standard local numbers starting with 01
  if (cleaned.startsWith("01")) {
    cleaned = "+88" + cleaned;
  }

  // 5. Strict validation against Bangladeshi mobile network prefixes:
  // Operator codes: 013, 014, 015, 016, 017, 018, 019 (+8801[3-9] followed by 8 digits)
  const BD_PHONE_REGEX = /^\+8801[3-9]\d{8}$/;
  if (!BD_PHONE_REGEX.test(cleaned)) {
    throw new Error(
      `Invalid Bangladeshi phone number "${rawPhone}". Expected format: +8801XXXXXXXXX (11 digits).`
    );
  }

  return cleaned;
}

export const SendOtpInputSchema = z.object({
  phoneNumber: z.string().transform((val, ctx) => {
    try {
      return normalizeBdPhoneNumber(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : "Invalid phone number",
      });
      return z.NEVER;
    }
  }),
});

export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

export const VerifyOtpInputSchema = z.object({
  phoneNumber: z.string().transform((val, ctx) => {
    try {
      return normalizeBdPhoneNumber(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : "Invalid phone number",
      });
      return z.NEVER;
    }
  }),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit numeric string"),
  deviceFingerprint: z.string().min(1).default("default-device-fp"),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

export const GoogleAuthInputSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
  deviceFingerprint: z.string().default("default-device-fp"),
});

export type GoogleAuthInput = z.infer<typeof GoogleAuthInputSchema>;

export const MagicLinkRequestSchema = z.object({
  email: z.string().email("A valid email address is required"),
});

export type MagicLinkRequest = z.infer<typeof MagicLinkRequestSchema>;

export const VerifyMagicLinkSchema = z.object({
  token: z.string().min(16, "Invalid or malformed verification token"),
  deviceFingerprint: z.string().default("default-device-fp"),
});

export type VerifyMagicLink = z.infer<typeof VerifyMagicLinkSchema>;
