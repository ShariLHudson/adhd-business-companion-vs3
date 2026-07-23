/**
 * Continuity owner-kind priority (sticky workflows).
 *
 * Intent-family priority is authoritative in
 * `lib/conversationRouter` → `AUTHORITATIVE_ROUTING_PRIORITY`
 * (direct navigation / cancel outrank awaiting-answer owners).
 *
 * Broad intent / primary classifiers must not run before active ownership checks
 * unless a higher-priority intent family already resolved.
 */

import type { ConversationOwnerKind } from "./types";

export const CONVERSATION_ROUTING_PRIORITY = [
  "explicit_exit",
  "explicit_task_change",
  "guided_workflow",
  "artifact",
  "chamber_specialist",
  "board_director",
  "board_intake",
  "board_discussion",
  "stored_content",
  "navigation",
  "general_chat",
] as const;

export type ConversationRoutingPriorityStep =
  (typeof CONVERSATION_ROUTING_PRIORITY)[number];

const OWNER_KIND_PRIORITY: Record<ConversationOwnerKind, number> = {
  guided_workflow: 3,
  artifact: 4,
  chamber_specialist: 5,
  board_director: 6,
  board_intake: 7,
  board_discussion: 8,
  navigation: 9,
  general_chat: 10,
};

export function ownerKindPriority(kind: ConversationOwnerKind): number {
  return OWNER_KIND_PRIORITY[kind];
}

/** Lower number wins. */
export function compareOwnerKinds(
  a: ConversationOwnerKind,
  b: ConversationOwnerKind,
): number {
  return ownerKindPriority(a) - ownerKindPriority(b);
}

export function isStickyContinuityOwner(kind: ConversationOwnerKind): boolean {
  return (
    kind === "guided_workflow" ||
    kind === "artifact" ||
    kind === "chamber_specialist" ||
    kind === "board_director" ||
    kind === "board_intake" ||
    kind === "board_discussion"
  );
}
