import {
  isCanonicalPlaceSuggestionMenu,
  repairInventedEstatePlaceList,
} from "@/lib/estate/estatePlaceIdentityLock";

const VAGUE_OFFER_RE =
  /\b(?:which of those|which one feels right)\b/i;

const PLACE_SUGGESTION_CLARIFY_RE =
  /\b(?:suggestions?|not take me|don't take me|do not take me|without (?:going|rushing)|give me (?:some )?(?:options|places|suggestions)|wanted you to give)\b/i;

const CONFUSION_RE =
  /\b(?:which of what|what (?:ones?|options)|those what|what are (?:those|you offering)|what did you mean|be more specific|i (?:didn'?t|don'?t) understand|that (?:wasn'?t|isn'?t) clear|you weren'?t clear)\b/i;

export function assistantMadeVagueOffer(lastAssistantText: string): boolean {
  const t = lastAssistantText.trim();
  if (!t) return false;
  return VAGUE_OFFER_RE.test(t);
}

export function isVagueOfferConfusion(
  userText: string,
  lastAssistantText?: string,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (PLACE_SUGGESTION_CLARIFY_RE.test(t)) return false;
  if (CONFUSION_RE.test(t)) return true;
  if (lastAssistantText && assistantMadeVagueOffer(lastAssistantText)) {
    return true;
  }
  return false;
}

export function vagueOfferConfusionReply(): string {
  return "You're right — I wasn't clear. What's actually on your mind right now?";
}

const NUMBERED_LINE_RE = /^\s*\d+[.)]\s+/gm;

/** Numbered menu of estate rooms — forbidden router pattern. */
export function looksLikeNumberedEstateRoomMenu(text: string): boolean {
  const numbered = text.match(NUMBERED_LINE_RE) ?? [];
  if (numbered.length < 2) return false;
  return /\b(?:music room|apple orchard|conservatory|peaceful places|estate|orchard|greenhouse|library|gazebo)\b/i.test(
    text,
  );
}

/** System-generated numbered place menus (1–3 canonical places) are allowed. */
export function isSystemEstatePlaceChoiceMenu(text: string): boolean {
  return isCanonicalPlaceSuggestionMenu(text);
}

export function repairNumberedEstateRoomMenu(
  text: string,
  userText?: string,
): string {
  if (!looksLikeNumberedEstateRoomMenu(text)) return text;
  if (isSystemEstatePlaceChoiceMenu(text)) return text;
  const repaired = repairInventedEstatePlaceList(text, userText);
  return repaired !== text ? repaired : text;
}
