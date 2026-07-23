/**
 * Map Continuity + chatScope into the shared ConversationScopeOwner contract.
 */

import {
  getActiveConversationOwner,
  type ConversationOwner,
} from "@/lib/conversationContinuity";
import {
  getActiveChatScope,
  getDaySession,
  type ChatScopeKind,
} from "@/lib/chatScope";
import type {
  ConversationScopeOwner,
  RoutingIntentFamily,
  RoutingScopeType,
} from "./routingTypes";
import { chatScopeKindToRoutingScope } from "./routingTypes";

const OWNER_KIND_TO_SCOPE: Record<string, RoutingScopeType> = {
  guided_workflow: "guided_creation",
  artifact: "guided_creation",
  chamber_specialist: "chamber_member",
  board_director: "board_discussion",
  board_intake: "board_discussion",
  board_discussion: "board_discussion",
  navigation: "estate_destination",
  general_chat: "global_companion",
};

const DEFAULT_CLAIMED: readonly RoutingIntentFamily[] = [
  "answer_pending_question",
  "modify_current_work",
  "ask_destination_or_specialist",
] as const;

/**
 * An owner may claim a turn only when active, IDs match, intent is allowed,
 * and no higher-priority intent already resolved.
 */
export function ownerMayClaimTurn(input: {
  owner: ConversationScopeOwner | null;
  intentFamily: RoutingIntentFamily;
  conversationId?: string | null;
  daySessionId?: string | null;
  higherPriorityResolved: boolean;
}): boolean {
  const { owner } = input;
  if (!owner || !owner.active) return false;
  if (input.higherPriorityResolved) return false;
  if (
    owner.conversationId &&
    input.conversationId &&
    owner.conversationId !== input.conversationId
  ) {
    return false;
  }
  if (
    owner.daySessionId &&
    input.daySessionId &&
    owner.daySessionId !== input.daySessionId
  ) {
    return false;
  }
  if (!owner.claimedIntentFamilies.includes(input.intentFamily)) {
    // Awaiting-answer scopes may still claim answer_pending_question.
    if (
      !(
        owner.awaitingAnswer &&
        input.intentFamily === "answer_pending_question"
      )
    ) {
      return false;
    }
  }
  return true;
}

export function conversationOwnerToScopeOwner(
  owner: ConversationOwner,
  opts?: {
    conversationId?: string | null;
    destinationId?: string | null;
  },
): ConversationScopeOwner {
  const day = getDaySession();
  const scopeType =
    OWNER_KIND_TO_SCOPE[owner.kind] ?? ("global_companion" as RoutingScopeType);
  let sourceId: string | null = null;
  switch (owner.kind) {
    case "guided_workflow":
      sourceId = owner.workflowId;
      break;
    case "artifact":
      sourceId = owner.artifactId;
      break;
    case "chamber_specialist":
      sourceId = owner.memberId;
      break;
    case "board_director":
      sourceId = owner.directorId;
      break;
    case "board_intake":
      sourceId = owner.discussionDraftId;
      break;
    case "board_discussion":
      sourceId = owner.discussionId;
      break;
    case "navigation":
      sourceId = owner.destinationId;
      break;
    default:
      sourceId = null;
  }

  return {
    id: `continuity:${owner.kind}:${sourceId ?? "active"}`,
    scopeType,
    sourceId,
    conversationId: opts?.conversationId ?? day.conversationId,
    daySessionId: day.daySessionId,
    destinationId: opts?.destinationId ?? null,
    active: true,
    resumable: owner.kind !== "general_chat" && owner.kind !== "navigation",
    awaitingAnswer: Boolean(owner.awaitingAnswer),
    pendingQuestionId: owner.awaitingAnswer
      ? `pending:${owner.kind}`
      : null,
    claimedIntentFamilies: DEFAULT_CLAIMED,
    priority: owner.awaitingAnswer ? 40 : 50,
  };
}

export function resolveActiveScopeOwner(input?: {
  conversationId?: string | null;
  destinationId?: string | null;
  activeSection?: string | null;
}): ConversationScopeOwner {
  const continuity = getActiveConversationOwner({
    activeSection: input?.activeSection,
  });
  const chatScope = getActiveChatScope();
  const day = getDaySession();

  // Sticky Continuity owners take precedence over bare chatScope.
  if (
    continuity.kind !== "general_chat" &&
    continuity.kind !== "navigation"
  ) {
    return conversationOwnerToScopeOwner(continuity, {
      conversationId: input?.conversationId ?? day.conversationId,
      destinationId: input?.destinationId ?? null,
    });
  }

  if (chatScope?.active) {
    return {
      id: chatScope.scopeId,
      scopeType: chatScopeKindToRoutingScope(chatScope.kind as ChatScopeKind),
      sourceId: chatScope.sourceId,
      conversationId: input?.conversationId ?? day.conversationId,
      daySessionId: day.daySessionId,
      destinationId: input?.destinationId ?? null,
      active: true,
      resumable: chatScope.resumable,
      awaitingAnswer: chatScope.pendingQuestion,
      pendingQuestionId: chatScope.pendingQuestion
        ? `pending:${chatScope.scopeId}`
        : null,
      claimedIntentFamilies: DEFAULT_CLAIMED,
      priority: 60,
    };
  }

  return conversationOwnerToScopeOwner(continuity, {
    conversationId: input?.conversationId ?? day.conversationId,
    destinationId: input?.destinationId ?? null,
  });
}
