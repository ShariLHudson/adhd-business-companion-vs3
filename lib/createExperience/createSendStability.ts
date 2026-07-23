/**
 * Create chat send stability — keep blueprint/session state on API failure;
 * never navigate or reload while waiting for a companion-chat response.
 */

import { SafeJsonResponseError } from "@/lib/safeJsonResponse";

export const CREATE_CHAT_RETRY_REPLY =
  "Something got tangled for a second — your Landing Page work is still here. Send that again whenever you're ready." as const;

export type CreateSendProtectSnapshot = {
  awaitingResponse: boolean;
  workspacePanel: string | null;
  createBuilderActive: boolean;
  splitCreateChat: boolean;
};

/** True while Create split/workspace session should survive a failed chat turn. */
export function isProtectedCreateSession(
  snapshot: CreateSendProtectSnapshot,
): boolean {
  if (snapshot.awaitingResponse) return true;
  if (snapshot.splitCreateChat) return true;
  if (
    snapshot.workspacePanel === "content-generator" &&
    snapshot.createBuilderActive
  ) {
    return true;
  }
  return false;
}

/** Block Welcome Home / room hops / panel clears during an in-flight Create send. */
export function shouldBlockNavigationDuringCreateSend(
  snapshot: CreateSendProtectSnapshot,
): boolean {
  return snapshot.awaitingResponse && isProtectedCreateSession(snapshot);
}

export function isCompanionChatHttpFailure(err: unknown): boolean {
  if (err instanceof SafeJsonResponseError) {
    return typeof err.status === "number" && err.status >= 400;
  }
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("companion-chat-unavailable") ||
    msg.includes("model unavailable") ||
    msg.includes("service unavailable") ||
    msg.startsWith("companion-chat-http-") ||
    /\b503\b/.test(msg) ||
    /\b502\b/.test(msg) ||
    /\b500\b/.test(msg)
  );
}

export function companionChatHttpFailureError(
  status: number,
  apiError?: string,
): Error {
  const label = apiError?.trim() || "companion-chat-unavailable";
  return new Error(`companion-chat-http-${status}: ${label}`);
}

/** Inline Create failure reply — always includes a retry cue; never navigates. */
export function buildCreateChatFailureReply(userText?: string): string {
  const trimmed = userText?.trim() ?? "";
  if (!trimmed) return CREATE_CHAT_RETRY_REPLY;
  return CREATE_CHAT_RETRY_REPLY;
}
