/**
 * Builder content sync — distinguish CONTENT from APPROVAL in active builders.
 * Chat thinks; the builder stores. Users should never copy/paste between them.
 */

import type { WorkspaceFieldId } from "./workspaceAwareness";
import { extractNumberedOptions } from "./workspaceSop";

const BUILDER_APPROVAL_EXACT_RE =
  /^(?:yes|yes please|yep|yeah|yup|ok|okay|sure|sounds good|works for me|perfect|i like it|that'?s good|that'?s fine|that works|looks good|correct|right|good|that one|use that|let'?s do it|please do|go ahead|these are good|those are good|that'?s right|use those|use these|save that|add them|add this|put that in)\.?$/i;

const BUILDER_APPROVAL_LOOSE_RE =
  /\b(?:yes please|looks good|these are good|those are good|that'?s right|use those|use these|save that|sounds good|perfect|add them|add this|put that in|i like (?:it|them|those)|that works)\b/i;

const BUILDER_ADD_COMMAND_RE =
  /\b(?:add (?:information|info|this|those|them|it)(?:\s+to(?:\s+the)?\s+avatar)?|add to (?:the )?avatar|save to (?:the )?avatar|put (?:that|this|those|them) in(?:\s+the\s+avatar)?)\b/i;

const BUILDER_OFFER_ADD_RE =
  /\bwould you like me to add (?:these|those|this|them)\b|\b(?:shall|should) i add (?:these|those)\b|\badd (?:these|those) (?:as |to |in )/i;

/** User is asking — not providing field content. */
export function isUserQuestionText(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\?\s*$/.test(t)) return true;
  return /^(?:what|why|how|when|where|who|can you|could you|should i|is it|are they|do i|does|would|will)\b/i.test(
    t,
  );
}

/** User is approving previously generated content — not providing new field text. */
export function isBuilderApprovalPhrase(text: string): boolean {
  const t = text.trim().replace(/[.!?]+$/g, "").trim();
  if (!t) return false;
  if (BUILDER_APPROVAL_EXACT_RE.test(t)) return true;
  if (t.length <= 48 && BUILDER_APPROVAL_LOOSE_RE.test(t)) return true;
  return false;
}

/** User is asking to apply chat content to the builder — not providing literal field text. */
export function isBuilderAddCommand(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isBuilderApprovalPhrase(t)) return true;
  return BUILDER_ADD_COMMAND_RE.test(t);
}

export function assistantOfferedBuilderAdd(assistantText: string): boolean {
  return BUILDER_OFFER_ADD_RE.test(assistantText);
}

/** Extract list or substantive content Shari generated for the user to approve. */
export function extractPendingBuilderContent(assistantText: string): string | null {
  const text = assistantText.trim();
  if (!text) return null;

  const bulletLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^(?:[*•\-]|\d+\.)\s+\S/.test(l));

  if (bulletLines.length >= 2) {
    return bulletLines
      .map((l) =>
        l.replace(/^\d+\.\s+/, "• ").replace(/^[*•\-]\s+/, "• "),
      )
      .join("\n");
  }

  if (bulletLines.length === 1 && text.length > bulletLines[0]!.length + 30) {
    return bulletLines[0]!.replace(/^\d+\.\s+/, "• ").replace(/^[*•\-]\s+/, "• ");
  }

  const numbered = extractNumberedOptions(text);
  if (numbered.length >= 2) {
    return numbered.map((o) => `• ${o}`).join("\n");
  }

  const colonBlock = text.match(
    /(?:goals?|struggles?|pain points?|obstacles?|taglines?|audience|description)[:\s]+\n([\s\S]+)/i,
  );
  if (colonBlock?.[1]) {
    const block = colonBlock[1].trim();
    const innerBullets = block
      .split("\n")
      .filter((l) => /^(?:[*•\-]|\d+\.)\s+/.test(l.trim()));
    if (innerBullets.length >= 1) {
      return innerBullets
        .map((l) => l.trim().replace(/^\d+\.\s+/, "• ").replace(/^[*•\-]\s+/, "• "))
        .join("\n");
    }
  }

  const forExample = text.match(
    /\bfor example:\s*(.+?)(?:\.\s*(?:want|would you)|\.\s*$|\n)/i,
  );
  if (forExample?.[1]?.trim()) {
    return forExample[1].trim();
  }

  return null;
}

export function tryResolveBuilderApproval(
  userText: string,
  lastAssistantText: string,
  field: WorkspaceFieldId,
): { field: WorkspaceFieldId; value: string } | null {
  if (!isBuilderAddCommand(userText)) return null;
  if (isUserQuestionText(userText)) return null;
  const content = extractPendingBuilderContent(lastAssistantText);
  if (!content?.trim()) return null;
  if (isUserQuestionText(content)) return null;
  return { field, value: content.trim() };
}

/** Reject values that must never be written into builder fields. */
export function isInvalidBuilderFieldValue(
  value: string,
  userText = "",
): boolean {
  const v = value.trim();
  if (!v) return true;
  if (isUserQuestionText(v)) return true;
  if (isBuilderApprovalPhrase(v)) return true;
  if (userText.trim() && v === userText.trim() && isUserQuestionText(userText)) {
    return true;
  }
  return false;
}

export function builderContentSyncHintForChat(): string {
  return [
    "BUILDER CONTENT SYNC (mandatory when a builder is open beside chat):",
    "- Distinguish CONTENT (belongs in the field) from APPROVAL (user accepting your prior suggestion).",
    "- Approval phrases: yes, looks good, perfect, these are good, add them, add to avatar, save that, use those, etc.",
    "- NEVER write approval phrases into fields.",
    "- When you generate a list or draft for the current step, end with: Would you like me to add these to the avatar?",
    "- On approval: apply the generated content with [[fill:field-id:value]], confirm what was added, prompt the next step.",
    "- Chat = thinking/coaching; builder = storage. The user is never the copy/paste bridge.",
  ].join("\n");
}
