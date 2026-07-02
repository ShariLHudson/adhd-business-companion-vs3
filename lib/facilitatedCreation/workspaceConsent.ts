/**
 * Permission to open split workspace — separate from draft/build consent.
 */

import { isExplicitWorkspaceOpenRequest } from "@/lib/conversationGating";
import { userGrantedDraftPermission } from "@/lib/draftPermissionGate";
import { isFrictionlessAffirmation } from "@/lib/frictionlessActionLayer";

const WORKSPACE_OPEN_OFFER_RE =
  /\b(?:open (?:the )?workspace|workspace so we can|build it together|shape this together|work on it together|start shaping this|open create)\b/i;

const EXPLICIT_WORKSPACE_YES_RE =
  /\b(?:yes.{0,24}workspace|open (?:the )?workspace|let'?s open|show me the workspace)\b/i;

export function assistantOfferedWorkspaceOpen(lastAssistantText: string): boolean {
  const t = lastAssistantText.trim();
  if (!t) return false;
  return WORKSPACE_OPEN_OFFER_RE.test(t);
}

export function userGrantedWorkspaceOpen(
  userText: string,
  lastAssistantText = "",
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isExplicitWorkspaceOpenRequest(t)) return true;
  if (EXPLICIT_WORKSPACE_YES_RE.test(t)) return true;
  if (
    assistantOfferedWorkspaceOpen(lastAssistantText) &&
    isFrictionlessAffirmation(t)
  ) {
    return true;
  }
  if (userGrantedDraftPermission(t, lastAssistantText)) return true;
  return false;
}

export function buildWorkspaceOpenConsentOffer(artifactType?: string | null): string {
  const label = artifactType?.trim();
  if (label) {
    return (
      `We have enough to start shaping your **${label}**. ` +
      `Would you like me to open the workspace so we can build it together?`
    );
  }
  return (
    "We have enough to start shaping this. " +
    "Would you like me to open the workspace so we can build it together?"
  );
}

export function facilitationStayInChatMessage(userText: string): string {
  if (/\bworkshop\b/i.test(userText)) {
    return (
      "That sounds worth exploring. What kind of transformation would you want people to experience?"
    );
  }
  if (/\boffer\b/i.test(userText)) {
    return "Let's think this through first. Who is this offer really for?";
  }
  return (
    "Let's explore that together first — no workspace yet. What's the heart of what you're trying to create?"
  );
}
