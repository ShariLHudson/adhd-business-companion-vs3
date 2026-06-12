const SESSION_SALT = "founder-admin-session-v1";

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Deterministic session token derived from the admin password (server-only). */
function adminPasswordSecret(): string {
  return process.env.FOUNDER_ADMIN_PASSWORD?.trim() ?? "";
}

export async function founderAdminToken(): Promise<string> {
  const secret = adminPasswordSecret();
  if (!secret) return "";
  return hmacSha256Hex(secret, SESSION_SALT);
}

export async function verifyFounderAdminToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const expected = await founderAdminToken();
  if (!expected) return false;
  return timingSafeEqualString(token, expected);
}

export function isFounderAdminConfigured(): boolean {
  return Boolean(adminPasswordSecret());
}
