/**
 * Send gate diagnostics — why a member message did or did not send.
 *
 * Dev console: window.__sparkSendAttemptLog
 */

import {
  getActivePipelineTrace,
  isPipelineTurnSealed,
} from "./conversationPipelineTrace";
import { hasActivePendingChoice } from "@/lib/pendingChoice";

export type SendAttemptLog = {
  rawText: string;
  trimmedText: string;
  isSending: boolean;
  isThinking: boolean;
  isStreaming: boolean;
  pipelineLocked: boolean;
  turnSealed: boolean;
  blockedOwner: string | null;
  pendingChoice: boolean;
  returnReasonIfBlocked: string | null;
  at: number;
};

declare global {
  interface Window {
    __sparkSendAttemptLog?: SendAttemptLog[];
  }
}

const inMemoryLog: SendAttemptLog[] = [];

export function canSendChatMessage(trimmedText: string): boolean {
  return Boolean(trimmedText.trim());
}

/** UI must never block send on isLoading — only empty text. */
export function uiSendGateBlocked(
  trimmedText: string,
  _isSending: boolean,
): string | null {
  if (!canSendChatMessage(trimmedText)) return "empty_trim";
  return null;
}

export type SendGateInput = {
  rawText: string;
  trimmedText: string;
  isSending: boolean;
  isThinking: boolean;
  isStreaming: boolean;
};

export function buildSendGateSnapshot(
  input: SendGateInput,
): Omit<SendAttemptLog, "at"> {
  const active = getActivePipelineTrace();
  const uiBlock = uiSendGateBlocked(input.trimmedText, input.isSending);
  return {
    rawText: input.rawText,
    trimmedText: input.trimmedText,
    isSending: input.isSending,
    isThinking: input.isThinking,
    isStreaming: input.isStreaming,
    pipelineLocked: Boolean(active && !active.ownerComplete),
    turnSealed: isPipelineTurnSealed(),
    blockedOwner: active?.blockedOwner ?? null,
    pendingChoice: hasActivePendingChoice(),
    returnReasonIfBlocked: uiBlock,
  };
}

export function logSendAttempt(
  snapshot: Omit<SendAttemptLog, "at">,
): SendAttemptLog {
  const record: SendAttemptLog = { ...snapshot, at: Date.now() };
  inMemoryLog.push(record);
  if (typeof window !== "undefined") {
    const log = window.__sparkSendAttemptLog ?? [];
    log.push(record);
    window.__sparkSendAttemptLog = log.slice(-80);
  }
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    // eslint-disable-next-line no-console
    console.info("SEND_ATTEMPT", record);
  }
  return record;
}

export function getSendAttemptLog(): SendAttemptLog[] {
  if (typeof window !== "undefined" && window.__sparkSendAttemptLog) {
    return window.__sparkSendAttemptLog;
  }
  return inMemoryLog;
}

export function resetSendAttemptLog(): void {
  inMemoryLog.length = 0;
  if (typeof window !== "undefined") {
    window.__sparkSendAttemptLog = [];
  }
}
