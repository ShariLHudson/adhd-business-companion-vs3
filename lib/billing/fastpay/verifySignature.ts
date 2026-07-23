/**
 * FastPay webhook authenticity — HMAC-SHA256 of the raw body.
 * Header: X-FastPay-Signature
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function getFastPayWebhookSecret(): string | null {
  const secret = process.env.FASTPAY_WEBHOOK_SECRET?.trim();
  return secret ? secret : null;
}

export function computeFastPaySignature(
  rawBody: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

function normalizeSignatureHeader(header: string): string {
  const trimmed = header.trim();
  // Support "sha256=<hex>" and bare hex.
  const prefixed = trimmed.match(/^sha256=(.+)$/i);
  return (prefixed?.[1] ?? trimmed).trim().toLowerCase();
}

/**
 * Constant-time compare of provider signature vs expected HMAC.
 * Returns false when secret/signature missing or lengths differ.
 */
export function verifyFastPaySignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string | null | undefined = getFastPayWebhookSecret(),
): boolean {
  if (!secret || !signatureHeader) return false;
  const expected = computeFastPaySignature(rawBody, secret);
  const provided = normalizeSignatureHeader(signatureHeader);
  if (!provided || provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}
