/**
 * Conversation → capability handoff — pass the answer, not only the original ask.
 */

import { newCreationWorkspaceId } from "@/lib/creationWorkspace/ids";
import type { ShariConversationHandoff, ShariResponseDecision } from "./types";
import { SHARI_ANSWER_FIRST_HANDOFF_KEY } from "./types";

export function buildShariConversationHandoff(input: {
  decision: ShariResponseDecision;
  answerContent: string;
  destination: ShariConversationHandoff["destination"];
  sourceConversationId?: string | null;
  selectedContent?: string | null;
  userFollowUpContext?: string[];
}): ShariConversationHandoff {
  return {
    id: newCreationWorkspaceId("sch"),
    sourceConversationId: input.sourceConversationId ?? null,
    sourceMessageIds: [],
    originalRequest: input.decision.rawRequest,
    currentGoal: input.decision.normalizedRequest,
    answerContent: input.answerContent,
    selectedContent: input.selectedContent ?? null,
    userFollowUpContext: input.userFollowUpContext ?? [],
    researchStatus: input.decision.currentResearchRequired
      ? "current_required"
      : "stable_only",
    sourceReferences: [],
    assumptions: [],
    unresolvedQuestions: [],
    destination: input.destination,
    intendedOutcome: `Continue from Shari’s answer into ${input.destination}`,
    returnContext: "Return to conversation",
    createdAt: new Date().toISOString(),
  };
}

export function storeShariConversationHandoff(
  handoff: ShariConversationHandoff,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SHARI_ANSWER_FIRST_HANDOFF_KEY,
      JSON.stringify(handoff),
    );
  } catch {
    /* ignore */
  }
}

export function peekShariConversationHandoff(): ShariConversationHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SHARI_ANSWER_FIRST_HANDOFF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShariConversationHandoff;
  } catch {
    return null;
  }
}

export function clearShariConversationHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SHARI_ANSWER_FIRST_HANDOFF_KEY);
  } catch {
    /* ignore */
  }
}

/** Seed text for Create / other destinations from the answered conversation. */
export function seedFromShariConversationHandoff(
  handoff: ShariConversationHandoff,
): string {
  const parts = [
    handoff.currentGoal,
    "",
    handoff.answerContent.slice(0, 6000),
  ];
  if (handoff.userFollowUpContext.length) {
    parts.push("", "Follow-up context:", ...handoff.userFollowUpContext);
  }
  return parts.join("\n");
}
