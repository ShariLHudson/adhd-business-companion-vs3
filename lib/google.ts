// Google OAuth + Docs helpers. Requires env vars (see GOOGLE_SETUP.md):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
// Tokens live in an httpOnly cookie (fine for a single-user/local app).

export const G_COOKIE = "g_tokens";
export const GOOGLE_SCOPE =
  "https://www.googleapis.com/auth/drive.file openid email";

export type GTokens = {
  access_token: string;
  refresh_token?: string;
  expiry: number; // epoch ms
  email?: string;
};

export function googleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  };
}

export function googleConfigured(): boolean {
  const c = googleConfig();
  return Boolean(c.clientId && c.clientSecret && c.redirectUri);
}

export function parseTokens(raw: string | undefined): GTokens | null {
  if (!raw) return null;
  try {
    const t = JSON.parse(raw);
    if (t && typeof t.access_token === "string") return t as GTokens;
  } catch {
    /* ignore */
  }
  return null;
}

// Refresh the access token if it's expired (or about to be).
export async function refreshIfNeeded(t: GTokens): Promise<GTokens> {
  if (Date.now() < t.expiry - 60_000) return t;
  if (!t.refresh_token) return t;
  const c = googleConfig();
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.clientId,
        client_secret: c.clientSecret,
        refresh_token: t.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    if (!r.ok) return t;
    const j = await r.json();
    return {
      ...t,
      access_token: j.access_token ?? t.access_token,
      expiry: Date.now() + (j.expires_in ?? 3600) * 1000,
    };
  } catch {
    return t;
  }
}
