/**
 * Turn Owner — one handler owns each member message after classification.
 * Other systems observe; they must not reinterpret or override the owner.
 */

import type { PrimaryTurnDecision } from "./primaryTurnClassifier";
import type { PendingChoiceResolveResult } from "@/lib/pendingChoice/types";

export type TurnOwnerKind =
  | "pending_choice"
  | "relationship_chat"
  | "direct_navigation"
  | "estate_kernel"
  | "create_workflow"
  | "research_learn"
  | "support_restoration"
  | "concierge_recommendation"
  | "in_room_action"
  | "implied_need"
  | "frictionless_local"
  | "companion_api"
  | "recovered"
  | "unknown";

export type TurnOwnerRecord = {
  turn: number;
  rawMessage: string;
  normalizedMessage: string;
  owner: TurnOwnerKind;
  intent?: string | null;
  currentRoom?: string | null;
  pendingChoices?: boolean;
  pendingChoiceType?: string | null;
  capabilityMatch?: string | null;
  navigationTarget?: string | null;
  workflowTarget?: string | null;
  failureReason?: string | null;
  elapsedMs?: number;
  recovered?: boolean;
};

declare global {
  interface Window {
    __sparkTurnOwnerLog?: TurnOwnerRecord[];
  }
}

export function normalizeTurnMessage(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function ownerFromPrimaryTurn(
  decision: PrimaryTurnDecision,
): TurnOwnerKind {
  switch (decision.type) {
    case "DIRECT_COMMAND":
      return "direct_navigation";
    case "TASK_REQUEST":
      return "create_workflow";
    case "INFORMATION_OR_RESEARCH":
      return "research_learn";
    case "EMOTIONAL_SUPPORT":
      return "support_restoration";
    case "IMPLIED_NEED":
      return "implied_need";
    default:
      return "relationship_chat";
  }
}

export function ownerFromPendingResult(
  result: PendingChoiceResolveResult,
): TurnOwnerKind | null {
  switch (result.kind) {
    case "resolved":
    case "unrecognized":
    case "cancelled":
      return "pending_choice";
    case "topic_change":
      return null;
    default:
      return null;
  }
}

export function logTurnOwner(record: TurnOwnerRecord): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (typeof window === "undefined") return;

  const log = window.__sparkTurnOwnerLog ?? [];
  log.push(record);
  window.__sparkTurnOwnerLog = log.slice(-40);

  // eslint-disable-next-line no-console
  console.info("[turn-owner]", {
    turn: record.turn,
    owner: record.owner,
    intent: record.intent ?? null,
    room: record.currentRoom ?? null,
    pending: record.pendingChoices ?? false,
    nav: record.navigationTarget ?? null,
    workflow: record.workflowTarget ?? null,
    failure: record.failureReason ?? null,
    ms: record.elapsedMs ?? null,
    recovered: record.recovered ?? false,
    message: record.normalizedMessage.slice(0, 80),
  });
}
