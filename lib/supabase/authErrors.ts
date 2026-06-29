const AUTH_FETCH_TIMEOUT_MS = 20_000;

/** POST to a companion auth API route with a hard timeout. */
export async function postCompanionAuthApi(
  path: string,
  body: Record<string, unknown>,
  options?: { timeoutMs?: number },
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? AUTH_FETCH_TIMEOUT_MS;

  const attempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await attempt();
  } catch (error) {
    if (!isAuthRequestAborted(error)) throw error;
    return attempt();
  }
}

export function isAuthRequestTimeout(error: unknown): boolean {
  return isAuthRequestAborted(error);
}

export function isAuthRequestAborted(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "";
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("abort") ||
    lower.includes("aborted") ||
    lower.includes("signal is aborted")
  );
}

export function authRequestAbortedMessage(): string {
  return "Sign-in was interrupted. Please try once more.";
}

/** User-friendly message when Supabase or our auth API returns HTML instead of JSON. */
export function isEmailNotConfirmedError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("email not confirmed") ||
    lower.includes("not confirmed") ||
    lower.includes("confirm your email")
  );
}

export function emailNotConfirmedMessage(): string {
  return "Your email is not confirmed yet. Check spam/promotions, or resend the confirmation link below.";
}

export function sanitizeSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("abort") ||
    lower.includes("aborted") ||
    lower.includes("signal is aborted")
  ) {
    return authRequestAbortedMessage();
  }
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
