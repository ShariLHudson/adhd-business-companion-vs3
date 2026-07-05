/**
 * Pending estate-place menu — meta questions, expansion, and affirmations.
 * Does not change wander menu sources; only how pending choices respond.
 */

import { formatEstatePlaceSuggestionMenu } from "@/lib/estate/estatePlaceIdentityLock";
import { isLiveEstatePlace } from "@/lib/estate/liveEstatePlace";
import { ESTATE_WANDER_PLACE_ORDER } from "@/lib/estate/estateWanderNavigation";
import type { PendingChoiceState } from "./types";

const MENU_META_QUESTION_RE =
  /\b(?:(?:are|is)\s+(?:these|those|they)\s+(?:the\s+)?(?:only|just)\s+(?:three|3)\b|\b(?:only|just)\s+(?:three|3)\s+(?:places?|rooms?|spots?|options?)\b|\bwhat\s+are\s+(?:the\s+)?(?:three|3)\s+(?:places?|rooms?)\b|\bhow\s+many\s+(?:places?|rooms?)\b)/i;

const MENU_EXPANSION_RE =
  /\b(?:(?:tell me|show me)\s+(?:more|other|another)\s+(?:places?|rooms?|spots?|options?)|(?:what|any)\s+other\s+(?:places?|rooms?|spots?)|more\s+(?:places?|rooms?|options?)|(?:other|different)\s+(?:places?|rooms?|spots?))\b/i;

const MENU_AFFIRMATION_RE =
  /^(?:yes(?:\s+please)?|yep|yeah|yup|sure|ok(?:ay)?|sounds good|that works|perfect|great)\.?\s*(?:those\s+(?:places?|rooms?|spaces?|spots?|options?)|these\s+(?:places?|rooms?|spaces?|spots?|options?)|them|those|these)?\.?$/i;

/** Active create/email/SOP discovery — defer to universal creation pipeline. */
const CREATE_WORKFLOW_CONTINUATION_RE =
  /^(?:yes\s+)?(?:add\s+more|keep\s+going|go\s+on|continue|more\s+please|tell\s+me\s+more)\.?$/i;

export function isPendingMenuMetaQuestion(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return MENU_META_QUESTION_RE.test(t);
}

export function isPendingMenuExpansionRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return MENU_EXPANSION_RE.test(t);
}

export function isPendingMenuAffirmation(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return MENU_AFFIRMATION_RE.test(t);
}

export function isCreateWorkflowContinuation(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return CREATE_WORKFLOW_CONTINUATION_RE.test(t);
}

export function isQuestionShapedMenuInput(userText: string): boolean {
  const t = userText.trim().toLowerCase();
  if (!t) return false;
  if (t.includes("?")) return true;
  if (
    /^(?:what|which|where|how|why|when|who|are|is|do|does|did|can|could|would|will|tell me|show me)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(?:only|just)\s+(?:three|3|these|those)\b/.test(t)) return true;
  if (/\bhow many\b/.test(t)) return true;
  return false;
}

export function buildMenuMetaReply(state: PendingChoiceState): string {
  const count = state.choices.length;
  return [
    `There are many places across the Estate — those ${count} were just a starting sample, not the whole map.`,
    "You can pick one by number or name, ask for more places, or say show me the Estate map.",
  ].join(" ");
}

export function buildMenuAffirmationReply(state: PendingChoiceState): string {
  const names = state.choices.map((c) => c.label).join(", ");
  return `Good — ${names}. Which one feels right? Say a number or the name.`;
}

function offeredPlaceIds(state: PendingChoiceState): string[] {
  return state.choices
    .map((c) => c.destination ?? c.id)
    .filter((id): id is string => Boolean(id));
}

function pickNextLivePlaceIds(
  alreadyOffered: readonly string[],
  limit = 3,
): string[] {
  const offered = new Set(alreadyOffered);
  const fromWander = ESTATE_WANDER_PLACE_ORDER.filter(
    (id) => !offered.has(id) && isLiveEstatePlace(id),
  );
  if (fromWander.length >= 2) return fromWander.slice(0, limit);
  return [];
}

export function buildExpandedPlaceMenu(
  state: PendingChoiceState,
): { reply: string; menuText: string; placeIds: string[] } | null {
  if (state.pendingChoiceType !== "estate_place") return null;

  const already = offeredPlaceIds(state);
  const placeIds = pickNextLivePlaceIds(already);
  if (placeIds.length < 2) {
    return {
      reply:
        "We've covered the main suggestions I had handy — name any room you're picturing, or ask to see the Estate map.",
      menuText: state.menuText ?? "",
      placeIds: already,
    };
  }

  const menuText = formatEstatePlaceSuggestionMenu(placeIds, {
    intro: "Here are a few more places on the Estate:",
    closer:
      "Pick one by number or name — or ask for more if you'd like to keep browsing.",
  });

  return {
    reply: menuText,
    menuText,
    placeIds,
  };
}
