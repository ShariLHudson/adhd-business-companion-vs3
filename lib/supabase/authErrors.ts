const AUTH_FETCH_TIMEOUT_MS = 20_000;

/** POST to a companion auth API route with a hard timeout. */
export async function postCompanionAuthApi(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
  try {
    return await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function isAuthRequestTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** User-friendly message when Supabase or our auth API returns HTML instead of JSON. */
export function sanitizeSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("<!doctype") ||
    lower.includes("unexpected token '<'") ||
    lower.includes("is not valid json")
  ) {
    return "Could not connect to Supabase. In Vercel, confirm NEXT_PUBLIC_SUPABASE_URL (ends with .supabase.co) and paste the full Publishable key into NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.";
  }
  if (lower.includes("fetch") || lower.includes("network")) {
    return "Could not reach Supabase. Check that your project is active and the URL is correct.";
  }
  return message;
}

export async function parseAuthApiResponse(
  res: Response,
): Promise<{
  data: Record<string, unknown> | null;
  htmlOrInvalid: boolean;
}> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith("<")) {
    return { data: null, htmlOrInvalid: true };
  }
  try {
    return {
      data: JSON.parse(trimmed) as Record<string, unknown>,
      htmlOrInvalid: false,
    };
  } catch {
    return { data: null, htmlOrInvalid: true };
  }
}
