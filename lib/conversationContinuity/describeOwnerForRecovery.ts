/**
 * Recovery copy when generic fallbacks must not wipe recoverable context.
 */

import type { ConversationOwner } from "./types";

export function describeOwnerForRecovery(owner: ConversationOwner): string {
  switch (owner.kind) {
    case "guided_workflow":
      return `We were creating your ${owner.workflowType}. Let's continue from where we left off.`;
    case "artifact":
      if (owner.phase === "awaiting_action" || owner.phase === "approved") {
        return `Your ${owner.artifactType} is ready. Would you like to copy it, create a draft, send it, or make changes?`;
      }
      if (owner.activeSectionId) {
        return `We were working on that ${owner.artifactType} section. I can keep going from there.`;
      }
      return `We were still with your ${owner.artifactType}. Want to continue?`;
    case "chamber_specialist":
      return owner.topic
        ? `We were looking at ${owner.topic}. What would you like to explore next?`
        : "We're still with your Chamber specialist. What would help next?";
    case "board_director":
      return owner.topic
        ? `We're still with your Director on ${owner.topic}.`
        : "We're still with your Director. What would you like to take up?";
    case "board_intake":
      return `You were at the ${owner.currentStepId} step. Your earlier answers are still here.`;
    case "board_discussion":
      return "Your Board discussion is still open. We can continue from here.";
    case "navigation":
      return "I can take you there whenever you're ready.";
    case "general_chat":
    default:
      return "I'm still here with you.";
  }
}

const GENERIC_RECOVERY_RE =
  /(?:Fresh start\.?\s*What'?s on your mind|Pick up wherever you left off|What'?s the first piece you want to figure out|Tell me what you need|Let'?s start from the beginning|I'?m .+Intelligence\.?\s*What question)/i;

export function isGenericRecoveryCopy(text: string): boolean {
  return GENERIC_RECOVERY_RE.test(text.trim());
}

export function recoveryMustNotOverrideOwner(
  owner: ConversationOwner,
  proposedRecovery: string,
): boolean {
  if (owner.kind === "general_chat" || owner.kind === "navigation") {
    return false;
  }
  return isGenericRecoveryCopy(proposedRecovery);
}
