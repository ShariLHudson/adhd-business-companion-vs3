/**
 * Pending Strategy Chamber handoff envelope — session-scoped context travel.
 * Destinations consume once; Strategy remains source of truth for the decision.
 */

import type { AdaptivePresentationContext } from "@/lib/adaptiveCompanionIntelligence";
import type { ContinueJourneyDestinationId } from "./types";

export const STRATEGY_PENDING_HANDOFF_KEY =
  "spark:strategy-chamber-pending-handoff:v1" as const;

export type StrategyPendingHandoff = {
  strategyWorkItemId: string;
  destinationId: ContinueJourneyDestinationId;
  title: string;
  plainLanguageSummary: string;
  centralQuestion: string;
  chosenDirection?: string;
  /** Soft context for Talk It Out — avoid strategy jargon when possible */
  softContext?: string;
  boardBriefing?: {
    decision: string;
    whyItMatters: string;
    options: string[];
    risks: string[];
    questionsForBoard: string[];
  };
  createHandoff?: {
    suggestedArtifact: string;
    decisionSummary: string;
  };
  projectHandoff?: {
    chosenDirection: string;
    risks: string[];
    guardrails: string[];
  };
  presentationContext: AdaptivePresentationContext;
  memberApproved: true;
  createdAt: string;
};

const memory: { handoff: StrategyPendingHandoff | null } = { handoff: null };

export function setPendingStrategyHandoff(
  handoff: StrategyPendingHandoff,
): void {
  if (typeof window === "undefined") {
    memory.handoff = handoff;
    return;
  }
  try {
    window.sessionStorage.setItem(
      STRATEGY_PENDING_HANDOFF_KEY,
      JSON.stringify(handoff),
    );
  } catch {
    /* ignore */
  }
}

export function peekPendingStrategyHandoff(): StrategyPendingHandoff | null {
  if (typeof window === "undefined") return memory.handoff;
  try {
    const raw = window.sessionStorage.getItem(STRATEGY_PENDING_HANDOFF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StrategyPendingHandoff;
  } catch {
    return null;
  }
}

/** Read and clear — destinations should call once on open. */
export function consumePendingStrategyHandoff(): StrategyPendingHandoff | null {
  const handoff = peekPendingStrategyHandoff();
  if (typeof window === "undefined") {
    memory.handoff = null;
    return handoff;
  }
  try {
    window.sessionStorage.removeItem(STRATEGY_PENDING_HANDOFF_KEY);
  } catch {
    /* ignore */
  }
  return handoff;
}

export function __resetPendingStrategyHandoffForTests(): void {
  memory.handoff = null;
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STRATEGY_PENDING_HANDOFF_KEY);
}
