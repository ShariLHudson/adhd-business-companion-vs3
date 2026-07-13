/**
 * Whether the active owner should handle this turn before broad routing.
 */

import { isExplicitOwnerExit, isExplicitTaskChange } from "./exitRules";
import { isStickyContinuityOwner } from "./routingPriority";
import type { ConversationOwner } from "./types";

const REFERENTIAL_CONTINUATION_RE =
  /\b(?:the above|that section|number (?:one|two|three|\d)|what you just wrote|expand that|make it shorter|use that|no changes|i like it|write (?:it|that|the email)|continue|yes|good so far|draft it|build it out|add more detail|show me the finished)\b/i;

export function canOwnerHandleTurn(
  owner: ConversationOwner,
  userMessage: string,
): boolean {
  const t = userMessage.trim();
  if (!t) return false;
  if (isExplicitOwnerExit(t) || isExplicitTaskChange(t)) return false;

  if (!isStickyContinuityOwner(owner.kind)) {
    return false;
  }

  if (owner.kind === "guided_workflow" || owner.kind === "artifact") {
    if (owner.awaitingAnswer) return true;
    if (REFERENTIAL_CONTINUATION_RE.test(t)) return true;
    return true;
  }

  if (
    owner.kind === "chamber_specialist" ||
    owner.kind === "board_director" ||
    owner.kind === "board_discussion"
  ) {
    return true;
  }

  if (owner.kind === "board_intake") {
    return true;
  }

  return false;
}

/**
 * Gate used by the global router (Slice 2 wiring):
 * if active owner can handle and user did not exit → route to owner.
 */
export function shouldRouteToActiveOwner(
  owner: ConversationOwner,
  userMessage: string,
): boolean {
  return canOwnerHandleTurn(owner, userMessage);
}
