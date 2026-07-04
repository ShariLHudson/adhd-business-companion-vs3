/**
 * Primary turn ownership log — message, category, confidence, owner, final response.
 */

import type {
  PrimaryConversationType,
  PrimaryTurnConfidence,
  PrimaryTurnDecision,
} from "./primaryTurnClassifier";

export type PrimaryTurnLogEntry = {
  turn: number;
  message: string;
  category: PrimaryConversationType;
  confidence: PrimaryTurnConfidence;
  owner: string;
  reason: string;
  finalResponse?: string | null;
};

declare global {
  interface Window {
    __sparkPrimaryTurnLog?: PrimaryTurnLogEntry[];
  }
}

export function logPrimaryTurnClassification(
  turn: number,
  message: string,
  decision: PrimaryTurnDecision,
): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (typeof window === "undefined") return;

  const entry: PrimaryTurnLogEntry = {
    turn,
    message: message.slice(0, 200),
    category: decision.type,
    confidence: decision.confidence,
    owner: decision.owner,
    reason: decision.reason,
    finalResponse: null,
  };

  const log = window.__sparkPrimaryTurnLog ?? [];
  log.push(entry);
  window.__sparkPrimaryTurnLog = log.slice(-40);

  // eslint-disable-next-line no-console
  console.info("[primary-turn]", {
    turn: entry.turn,
    category: entry.category,
    confidence: entry.confidence,
    owner: entry.owner,
    reason: entry.reason,
    message: entry.message,
  });
}

export function recordPrimaryTurnFinalResponse(
  turn: number,
  finalResponse: string,
): void {
  if (typeof window === "undefined") return;
  const log = window.__sparkPrimaryTurnLog;
  if (!log?.length) return;
  const entry = [...log].reverse().find((row) => row.turn === turn);
  if (!entry) return;
  entry.finalResponse = finalResponse.slice(0, 300);
  // eslint-disable-next-line no-console
  console.info("[primary-turn:complete]", {
    turn,
    category: entry.category,
    owner: entry.owner,
    finalPreview: entry.finalResponse,
  });
}
