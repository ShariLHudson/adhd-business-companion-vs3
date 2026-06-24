/**
 * Teaching Mode — coach-style learning, not article dumps.
 * Conversation first; one concept at a time; paths before depth.
 */

import {
  isLearningPathMenuOffer,
  learningPathHintForSelection,
  learningPathMenuHintForChat,
  mapMenuLineLabelToKey,
  type LearningPathOptionKey,
} from "./learningPathMenu";
import { parseOptionSelection } from "./workspaceSop";

const TEACHING_VERB_RE =
  /\b(?:teach me|explain(?:\s+to me)?|help me understand|walk me through|tell me about|learn about|learn how)\b/i;

const WHAT_IS_RE =
  /\bwhat(?:'s| is| are)\s+(?:a |an |the )?[\w][\w\s-]{2,60}\b/i;

const SHOW_ME_HOW_RE = /\bshow me how\b/i;

const DETAILED_GUIDE_RE =
  /\b(?:full guide|detailed guide|complete guide|comprehensive(?:\s+guide)?|everything about|long explanation|write (?:me )?(?:an? )?(?:article|guide|overview)|give me (?:the )?full|entire guide)\b/i;

const APP_NAV_CONTEXT_RE =
  /\b(?:this app|the app|spark studio|sidebar|settings|momentum games?|clear my mind|focus audio|focus session|templates? library|how do i find|where (?:is|are|do i find)|change the colors?)\b/i;

const TEACHING_MENU_RE =
  /\b(?:would you like|which would you like|pick one|choose one|what sounds most helpful)\b/i;

const TEACHING_PATH_RE =
  /\b(?:quick answer|simple explanation|real[- ]world example|(?:^|\s)example\b|apply to my business|deep dive|build (?:one|it|your|my)?\s*together|example using)\b/i;

const PATH_PICK_RE =
  /\b(?:^|\b)(?:1|2|3|4|one|two|three|four|first|second|third|fourth|quick|simple|example|apply|deep|dive|business)\b/i;

/** User explicitly wants a long guide — allow multi-paragraph output. */
export function isDetailedGuideRequest(text: string): boolean {
  return DETAILED_GUIDE_RE.test(text.trim());
}

/** Business/concept teaching — not app navigation how-to. */
export function isConceptTeachingRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isDetailedGuideRequest(t)) return false;
  if (APP_NAV_CONTEXT_RE.test(t) && !TEACHING_VERB_RE.test(t)) return false;
  if (/\bdeep dive\b/i.test(t)) return true;

  if (TEACHING_VERB_RE.test(t)) return true;
  if (WHAT_IS_RE.test(t) && !APP_NAV_CONTEXT_RE.test(t)) return true;
  if (SHOW_ME_HOW_RE.test(t) && !APP_NAV_CONTEXT_RE.test(t)) return true;

  return false;
}

export function isTeachingMenuOffer(lastAssistantText: string): boolean {
  return isLearningPathMenuOffer(lastAssistantText);
}

function resolveContinuationPathKey(
  userText: string,
  lastAssistantText: string,
): LearningPathOptionKey | null {
  const lines = [...lastAssistantText.matchAll(/^\s*\d+\.\s*(.+)$/gm)].map(
    (m) => m[1]!.trim(),
  );
  const idx = parseOptionSelection(userText, Math.max(lines.length, 4));
  if (idx !== null && lines[idx]) {
    return mapMenuLineLabelToKey(lines[idx]);
  }
  const u = userText.trim().toLowerCase();
  if (/\b(?:1|one|quick|simple)\b/.test(u)) return "quick_answer";
  if (/\b(?:2|two)\b/.test(u) || /^example\b/.test(u)) return "example";
  if (/\b(?:3|three|apply)\b/.test(u)) return "apply_to_business";
  if (/\b(?:4|four|deep|dive)\b/.test(u)) return "deep_dive";
  return null;
}

/** User is continuing a teaching conversation (picked a path or asked for next piece). */
export function isTeachingContinuation(
  userText: string,
  lastAssistantText = "",
): boolean {
  const u = userText.trim();
  if (!u) return false;
  if (isDetailedGuideRequest(u)) return false;
  if (isTeachingMenuOffer(lastAssistantText) && PATH_PICK_RE.test(u)) {
    return true;
  }
  if (
    /\b(?:next (?:piece|part|step)|keep going|go on|continue|more detail|tell me more)\b/i.test(
      u,
    ) &&
    TEACHING_PATH_RE.test(lastAssistantText)
  ) {
    return true;
  }
  return false;
}

export function teachingModeActive(
  userText: string,
  lastAssistantText = "",
  opts?: { activeWorkflowLocked?: boolean },
): boolean {
  if (opts?.activeWorkflowLocked) return false;
  return (
    isConceptTeachingRequest(userText) ||
    isTeachingContinuation(userText, lastAssistantText)
  );
}

export function teachingModeHintForChat(
  userText: string,
  lastAssistantText = "",
): string {
  const topic = extractTeachingTopic(userText) ?? extractTeachingTopic(lastAssistantText);
  const continuing = isTeachingContinuation(userText, lastAssistantText);

  if (continuing) {
    const pathKey = resolveContinuationPathKey(userText, lastAssistantText);
    if (pathKey) {
      return learningPathHintForSelection(pathKey, topic ?? undefined);
    }
    return [
      "TEACHING MODE — CONTINUE (mandatory):",
      "Stay in coach mode: one concept, one step, one question.",
      "No relationship observations about the user.",
    ].join("\n");
  }

  return learningPathMenuHintForChat(topic);
}

export function extractTeachingTopic(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\bteach me(?:\s+about)?\s+(.+?)(?:[.?!]|$)/i,
    /\bexplain(?:\s+to me)?\s+(.+?)(?:[.?!]|$)/i,
    /\bhelp me understand\s+(.+?)(?:[.?!]|$)/i,
    /\bwhat(?:'s| is| are)\s+(?:a |an |the )?(.+?)(?:[.?!]|$)/i,
    /\btell me about\s+(.+?)(?:[.?!]|$)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3 && topic.length <= 80) {
      return topic.replace(/\s+and how\b.*$/i, "").trim();
    }
  }
  return null;
}
