/**
 * Wiring adapter (S3): build the shared Conversation Boundary Decision from live
 * conversation state, computed ONCE per turn. This is the only place the pure
 * `resolveConversationBoundary` is fed from the live stores.
 *
 * S3 scope: only the state needed for Create continuity is mapped. Topics feed
 * the topic snapshot (read-only), but Workflow / Pending / Offers are NOT wired
 * as clients yet (pendingQuestion is left null) — that is a later stage.
 */

import {
  resolveConversationBoundary,
  type BoundaryActiveTopic,
  type BoundaryActiveWork,
  type ConversationBoundaryDecision,
} from "./conversationBoundary";
import { toBoundarySuspendedItems } from "./conversationSuspension";
import {
  getActiveTopic,
  isActiveTopicUnresolved,
} from "./conversationStabilization/activeTopicStore";
import { loadSuspensionState } from "./conversationStabilization/suspensionStore";
import { loadUniversalCreationSession } from "./universalCreation";

function activeTopicSnapshot(): BoundaryActiveTopic | null {
  const topic = getActiveTopic();
  if (!topic) return null;
  return {
    topicId: topic.topicId,
    goal: topic.userGoal,
    unresolvedNeed: topic.unresolvedNeed,
    resolved: !isActiveTopicUnresolved(topic),
    startedAtTurn: topic.startedAtTurn,
    updatedAtTurn: topic.updatedAtTurn,
  };
}

function activeCreateSnapshot(): BoundaryActiveWork | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;
  if (session.lifecycle === "exited" || session.lifecycle === "completed") {
    return null;
  }
  return {
    kind: "create",
    id: `uc:${session.documentType}:t${session.startedAtTurn}`,
    artifactType: session.documentType,
    awaitingAnswer: true,
    // Any in-progress Create is worth preserving on interrupt/switch.
    suspendable: true,
  };
}

/**
 * Compute the turn's boundary decision from live state. Pure read of the stores;
 * never mutates. Returns a decision the continuity gate consumes to park (rather
 * than destroy) an active Create on an ambiguous turn.
 */
export function resolveTurnBoundaryDecision(input: {
  userText: string;
  turn: number;
  lastAssistantText?: string | null;
}): ConversationBoundaryDecision {
  return resolveConversationBoundary({
    userText: input.userText,
    turn: input.turn,
    activeTopic: activeTopicSnapshot(),
    activeWork: activeCreateSnapshot(),
    pendingQuestion: null, // Pending not wired in S3
    suspended: toBoundarySuspendedItems(loadSuspensionState()),
    lastAssistantText: input.lastAssistantText,
  });
}
