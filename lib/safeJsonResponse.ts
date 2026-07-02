/**
 * Defensive JSON parsing for Companion API calls.
 * Never surface raw HTML/DOCTYPE/JSON parse errors in chat UI.
 *
 * Member-visible copy is routed through companionContextRouting — not this file.
 */

import { logCompanionSystemFailure, sanitizeEstateFacingCopy } from "@/lib/companionContextRouting";
import { buildShariErrorRecoveryResponse } from "@/lib/conversation/shariCompanionEngine";

export const CHAT_RECOVERY_MESSAGE =
  "Something got tangled for a second. I'm still here — can we try that again?" as const;

export class SafeJsonResponseError extends Error {
  readonly userMessage: string;
  readonly status?: number;
  readonly contentType?: string | null;

  constructor(
    diagnostic: string,
    options?: {
      userMessage?: string;
      status?: number;
      contentType?: string | null;
    },
  ) {
    super(diagnostic);
    this.name = "SafeJsonResponseError";
    this.userMessage = options?.userMessage ?? CHAT_RECOVERY_MESSAGE;
    this.status = options?.status;
    this.contentType = options?.contentType;
  }
}

export function isJsonContentType(contentType: string | null): boolean {
  return Boolean(contentType?.toLowerCase().includes("application/json"));
}

const TECHNICAL_ERROR_RE =
  /unexpected token|doctype|<!doctype|is not valid json|syntaxerror|failed to execute 'json'|failed to fetch|networkerror|load failed/i;

export function isTechnicalFetchErrorMessage(message: string): boolean {
  return TECHNICAL_ERROR_RE.test(message);
}

export function friendlyFetchErrorMessage(err: unknown): string {
  logCompanionSystemFailure(err, { surface: "chat" });
  if (err instanceof SafeJsonResponseError) {
    return sanitizeEstateFacingCopy(err.userMessage);
  }
  return buildShariErrorRecoveryResponse();
}

export function logNonJsonResponseDiagnostic(
  url: string,
  res: Response,
  bodySnippet: string,
): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn("[companion-fetch] expected JSON response", {
    url,
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
    snippet: bodySnippet.slice(0, 160),
  });
}

/** Parse response body as JSON — throws SafeJsonResponseError, never SyntaxError to callers. */
export async function readJsonResponse<T = Record<string, unknown>>(
  res: Response,
  options?: { url?: string },
): Promise<T> {
  const contentType = res.headers.get("content-type");
  const text = await res.text();

  if (!isJsonContentType(contentType)) {
    logNonJsonResponseDiagnostic(options?.url ?? res.url, res, text);
    throw new SafeJsonResponseError(
      `Non-JSON response (${res.status}, ${contentType ?? "no content-type"})`,
      { status: res.status, contentType },
    );
  }

  if (!text.trim()) {
    throw new SafeJsonResponseError("Empty JSON body", {
      status: res.status,
      contentType,
    });
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    logNonJsonResponseDiagnostic(options?.url ?? res.url, res, text);
    throw new SafeJsonResponseError("Malformed JSON body", {
      status: res.status,
      contentType,
    });
  }
}

export async function fetchCompanionJson<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ res: Response; data: T }> {
  const url = typeof input === "string" ? input : input.toString();
  const res = await fetch(input, init);
  const data = await readJsonResponse<T>(res, { url });
  return { res, data };
}
