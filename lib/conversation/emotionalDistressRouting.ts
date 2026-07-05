/**
 * Emotional distress routing — stay with the member before environment offers.
 */

import {
  isGenuineEmotionalDistress,
  shouldSuppressEmotionalTools,
} from "@/lib/messageClassification";
import { isCreateFlowAssistantContext } from "@/lib/universalCreation/createFlowContext";
import {
  formatEmotionalFirstOpening,
  planEmotionalFirstResponse,
  shouldUseEmotionalFirstSequence,
} from "./emotionalFirstResponseSequence";
import { shouldSuggestPresenceModeForDistress } from "@/lib/estate/justBeHere";

export const SOMATIC_ANXIETY_RE =
  /\b(?:can'?t seem to relax|can'?t relax|catch(?:ing)? (?:my )?breath|can'?t catch (?:my )?breath|breathless|shortness of breath|can'?t breathe|hyperventilat|heart (?:is )?racing|chest feels tight)\b/i;

const EMOTIONAL_ASSISTANT_THREAD_RE =
  /\b(?:pressure here|body is responding|lot is landing|slow this down|calming audio|breathing reset|stay here with me|weighing on you|what(?:'s| is) been|hardest part|carrying a lot|doesn'?t mean you'?re failing|something matters)\b/i;

/** Spark asked what is hard / weighing — member is answering, not starting a new task. */
const EMOTIONAL_FOLLOW_UP_ASKED_RE =
  /\b(?:hardest part|weighing on you(?: most)?|what(?:'s| is) been (?:the )?(?:hardest|going on)|tell me (?:more|what)|what part of that)\b/i;

const EMOTIONAL_FOLLOW_UP_EXCLUDE_RE =
  /\b(?:take me|go to|open(?: the)?|create|write|draft|build|make|research|help me (?:create|write|draft))\b/i;

const EMOTIONAL_SUPPORT_MENU_OFFER_RE =
  /\b(?:would you like calming audio|calming audio,\s*a breathing reset|breathing reset,\s*or to stay here)\b/i;

export type EmotionalSupportMenuChoice = "focus-audio" | "breathe" | "stay";

export function isEmotionalSupportMenuOffer(
  lastAssistantText?: string | null,
): boolean {
  const last = lastAssistantText?.trim() ?? "";
  if (!last) return false;
  return EMOTIONAL_SUPPORT_MENU_OFFER_RE.test(last);
}

export function resolveEmotionalSupportMenuChoice(
  userText: string,
  lastAssistantText?: string | null,
): EmotionalSupportMenuChoice | null {
  const user = userText.trim().toLowerCase();
  const last = lastAssistantText?.trim() ?? "";
  if (!user || !isEmotionalSupportMenuOffer(last)) return null;

  if (
    /^1$/.test(user) ||
    /\b(?:calming audio|focus audio|calm(?:ing)? music)\b/i.test(user)
  ) {
    return "focus-audio";
  }
  if (
    /^2$/.test(user) ||
    /\b(?:breathing reset|breathe(?: and reset)?|breathing exercise)\b/i.test(user)
  ) {
    return "breathe";
  }
  if (
    /^3$/.test(user) ||
    /\b(?:stay here(?: with me)?|just stay|stay with me|keep talking)\b/i.test(
      user,
    )
  ) {
    return "stay";
  }
  return null;
}

export function isEmotionalSupportMenuSelection(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  return resolveEmotionalSupportMenuChoice(userText, lastAssistantText) != null;
}

const EMOTIONAL_THREAD_CONTINUATION_RE =
  /\b(?:trying to get everything done|not wanting to do anything|don'?t want to do anything|can'?t make myself|everything (?:is )?asking for attention|nothing is wrong with you|feels? full)\b/i;

export function isSomaticAnxietyDistress(text: string): boolean {
  return SOMATIC_ANXIETY_RE.test(text.trim());
}

export function isAnsweringEmotionalFollowUp(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  const user = userText.trim();
  const last = lastAssistantText?.trim() ?? "";
  if (!user || !last) return false;
  if (!EMOTIONAL_FOLLOW_UP_ASKED_RE.test(last)) return false;
  if (EMOTIONAL_FOLLOW_UP_EXCLUDE_RE.test(user)) return false;
  if (user.split(/\s+/).length > 28) return false;
  return true;
}

export function isEmotionalSupportThread(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  const user = userText.trim();
  const last = lastAssistantText?.trim() ?? "";
  if (!user) return false;
  if (last && isCreateFlowAssistantContext(last)) return false;
  if (isEmotionalSupportMenuSelection(user, last)) return true;
  if (isAnsweringEmotionalFollowUp(user, last)) return true;
  if (shouldUseEmotionalFirstSequence(user)) return true;
  if (isSomaticAnxietyDistress(user)) return true;
  if (isGenuineEmotionalDistress(user) && !shouldSuppressEmotionalTools(user)) {
    return true;
  }
  if (
    last &&
    EMOTIONAL_ASSISTANT_THREAD_RE.test(last) &&
    (isSomaticAnxietyDistress(user) ||
      shouldUseEmotionalFirstSequence(user) ||
      EMOTIONAL_THREAD_CONTINUATION_RE.test(user) ||
      /\b(?:i know|yeah|yes|right|still|can'?t)\b/i.test(user))
  ) {
    return true;
  }
  return false;
}

export function shouldSuppressEnvironmentNeedDuringDistress(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  return isEmotionalSupportThread(userText, lastAssistantText);
}

export function buildEmotionalContinuationReply(
  userText: string,
  lastAssistantText?: string | null,
): string {
  const menuChoice = resolveEmotionalSupportMenuChoice(
    userText,
    lastAssistantText,
  );
  if (menuChoice === "stay") {
    return "I'm right here. What's been weighing on you most?";
  }

  if (isAnsweringEmotionalFollowUp(userText, lastAssistantText)) {
    return [
      "That's a lot to hold — especially when you're already worn down.",
      "",
      "What part of that feels heaviest right now?",
    ].join("\n");
  }

  if (isSomaticAnxietyDistress(userText)) {
    return [
      "When your body won't settle like that, we don't have to fix anything yet — we can just be here.",
      "",
      "What's been weighing on you most today?",
    ].join("\n");
  }

  if (
    lastAssistantText?.trim() &&
    EMOTIONAL_ASSISTANT_THREAD_RE.test(lastAssistantText) &&
    /\b(?:i know|yeah|yes|right)\b/i.test(userText.trim())
  ) {
    return "I hear you. What's been the hardest part of today?";
  }

  const presenceSuggestion = shouldSuggestPresenceModeForDistress(userText);
  if (presenceSuggestion.suggest && presenceSuggestion.line) {
    const plan = planEmotionalFirstResponse({ text: userText });
    const opening = formatEmotionalFirstOpening(plan);
    if (opening) {
      return `${opening}\n\n${presenceSuggestion.line}`;
    }
    return presenceSuggestion.line;
  }

  const plan = planEmotionalFirstResponse({ text: userText });
  const opening = formatEmotionalFirstOpening(plan);
  if (opening) {
    return `${opening}\n\nWhat's been the hardest part today?`;
  }

  return "I'm here with you. What's been going on?";
}
