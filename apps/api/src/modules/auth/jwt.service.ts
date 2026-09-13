import crypto from "node:crypto";
import type { UserRole, TargetUnit } from "@admission-engine/types";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  phone?: string | null;
  email?: string;
  targetUnit?: TargetUnit;
  deviceFingerprint?: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private secret: string;

  constructor(secret = process.env["JWT_SECRET"] || "admission-engine-dev-secret-key-secure-2026") {
    this.secret = secret;
  }

  private base64UrlEncode(data: string | Buffer): string {
    const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
    return buf
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private base64UrlDecode(data: string): Buffer {
    let str = data.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4 !== 0) {
      str += "=";
    }
    return Buffer.from(str, "base64");
  }

  /**
   * Signs a JWT with HMAC-SHA256 signature.
   */
  sign(payload: JwtPayload, expiresInSeconds = 7 * 24 * 60 * 60): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: payload.iat || now,
      exp: payload.exp || now + expiresInSeconds,
    };

    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();

    const encodedSignature = this.base64UrlEncode(signature);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Verifies a JWT token in constant time using crypto.timingSafeEqual.
   */
  verify(token: string): JwtPayload {
    if (!token || typeof token !== "string") {
      throw new Error("Missing or invalid token format");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token segment structure");
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    if (!headerB64 || !payloadB64 || !signatureB64) {
      throw new Error("Invalid JWT format: missing segments");
    }

    // Verify HMAC-SHA256 signature
    const computedSignature = crypto
      .createHmac("sha256", this.secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest();

    const providedSignature = this.base64UrlDecode(signatureB64);

    if (
      computedSignature.length !== providedSignature.length ||
      !crypto.timingSafeEqual(computedSignature, providedSignature)
    ) {
      throw new Error("Invalid token signature");
    }

    // Parse payload
    const payloadStr = this.base64UrlDecode(payloadB64).toString("utf8");
    const payload = JSON.parse(payloadStr) as JwtPayload;

    // Verify expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      throw new Error("Token has expired");
    }

    return payload;
  }
}

export const defaultJwtService = new JwtService();
