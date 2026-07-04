/** Detect whether a Supabase JWT is safe for browser (anon) use. */
export function supabaseJwtRole(key: string): string | null {
  if (!key.startsWith("eyJ")) return null;
  try {
    const payload = key.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(payload, "base64url").toString("utf8"),
    ) as { role?: string };
    return json.role ?? null;
  } catch {
    return null;
  }
}

export function isBrowserSafeSupabaseKey(key: string): boolean {
  const v = key.trim();
  if (!v || v.startsWith("sb_secret_")) return false;
  if (v.startsWith("sb_publishable_")) {
    return (
      v.length >= 32 &&
      /^sb_publishable_[A-Za-z0-9_-]+$/.test(v)
    );
  }
  if (v.startsWith("eyJ")) {
    const role = supabaseJwtRole(v);
    return role === "anon" && v.length >= 40;
  }
  return v.length >= 80;
}
