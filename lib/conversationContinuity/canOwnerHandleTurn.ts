/**
 * Whether the active owner should handle this turn before broad routing.
 */

import { isDirectNavigationPriorityTurn } from "@/lib/chatScope";
import { isCreateIrrelevantUserTurn } from "./createOwnershipGuard";
import {
  classifyDocumentContinuity,
  shouldContinueStickyDocument,
} from "./documentContinuityClassifier";
import { isExplicitOwnerExit, isExplicitTaskChange } from "./exitRules";
import { isStickyContinuityOwner } from "./routingPriority";
import type { ConversationOwner } from "./types";

export function canOwnerHandleTurn(
  owner: ConversationOwner,
  userMessage: string,
): boolean {
  const t = userMessage.trim();
  if (!t) return false;
  if (isExplicitOwnerExit(t) || isExplicitTaskChange(t)) return false;
  // Direct navigation always outranks sticky Board / Create / Chamber locks.
  if (isDirectNavigationPriorityTurn(t)) return false;

  if (!isStickyContinuityOwner(owner.kind)) {
    return false;
  }

  if (owner.kind === "guided_workflow" || owner.kind === "artifact") {
    // Reflective life decisions / Create-room pushback never belong to Create.
    if (isCreateIrrelevantUserTurn(t)) return false;
    // P0 — only continue when the classifier says this turn still belongs
    // to the current document. New topics must not inherit automatically.
    const continuity = classifyDocumentContinuity({
      userText: t,
      activeOwner: owner,
      hasStickyDocument: true,
      awaitingAnswer: owner.awaitingAnswer,
    });
    return shouldContinueStickyDocument(continuity);
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
