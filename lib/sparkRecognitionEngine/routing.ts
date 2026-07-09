/**
 * Recognition routing — preserve-first, tone routing, context lock, member override.
 * Source of truth: SPARK_RECOGNITION_ENGINE.md + 032 + 044.
 */

import { getRecognitionRoomState } from "./roomState";
import {
  FESTIVE_TONES,
  REFLECTIVE_TONES,
  type RecognitionFastPathOption,
  type RecognitionRoomId,
  type RecognitionRoutingDecision,
  type RecognitionTone,
  type RecognitionTriggerMatch,
} from "./types";

export function isReflectiveTone(tone: RecognitionTone | undefined): boolean {
  if (!tone || tone === "neutral") return false;
  return (REFLECTIVE_TONES as readonly string[]).includes(tone);
}

export function isFestiveTone(tone: RecognitionTone | undefined): boolean {
  if (!tone || tone === "neutral") return false;
  return (FESTIVE_TONES as readonly string[]).includes(tone);
}

/** Tone → celebration destination. Member may override. */
export function celebrationRoomForTone(
  tone: RecognitionTone | undefined,
): RecognitionRoomId {
  if (isFestiveTone(tone)) return "celebration-room";
  if (isReflectiveTone(tone)) return "gardens";
  return "gardens";
}

export function toneSuggestionPrompt(
  tone: RecognitionTone | undefined,
): string {
  if (isFestiveTone(tone)) {
    return "This sounds joyful. Would you like to celebrate it in the Celebration Room™?";
  }
  if (isReflectiveTone(tone)) {
    return "This feels like it could be a quiet celebration. Does that fit?";
  }
  return "This sounds worth remembering. Would you like to preserve it in your Evidence Vault™?";
}

/**
 * Preserve-first default for meaningful but not clearly celebratory language.
 * Never routes to Create.
 */
export function buildPreserveFirstDecision(input?: {
  tone?: RecognitionTone;
  intentionalRoomEntry?: boolean;
}): RecognitionRoutingDecision {
  const path = input?.intentionalRoomEntry ? "full" : "fast";
  return {
    suggestedRoomId: "evidence-vault",
    path,
    preserveFirst: true,
    reason: "preserve_first_default",
    memberPrompt:
      "This sounds like something worth remembering. Would you like to preserve it in your Evidence Vault™?",
    options: ["preserve_it", "celebrate_it", "not_now"],
  };
}

export function buildCelebrationChoiceDecision(input?: {
  tone?: RecognitionTone;
}): RecognitionRoutingDecision {
  const suggested = celebrationRoomForTone(input?.tone);
  return {
    suggestedRoomId: suggested,
    path: "fast",
    preserveFirst: false,
    reason: "celebration_tone_choice",
    memberPrompt:
      "Would you like a quiet moment or a joyful celebration?",
    options: ["quiet_moment", "joyful_celebration", "help_me_decide", "not_now"],
  };
}

/**
 * Active room context wins over generic intent.
 * Explicit requested destination still wins overall.
 */
export function resolveContextLockedRoom(
  preferredSuggestion: RecognitionRoomId,
): RecognitionRoomId {
  const state = getRecognitionRoomState();
  if (state.requestedDestination) {
    const dest = state.requestedDestination as RecognitionRoomId;
    if (isRecognitionRoomId(dest)) return dest;
  }
  const visual = state.visualRoom as RecognitionRoomId | null;
  if (visual && isRecognitionRoomId(visual)) {
    if (visual === "evidence-vault") return "evidence-vault";
    if (visual === "gardens") return "gardens";
    if (visual === "celebration-room") return "celebration-room";
    if (visual === "gallery-of-firsts") return "gallery-of-firsts";
    if (visual === "legacy-studio") return "legacy-studio";
  }
  return preferredSuggestion;
}

export function isRecognitionRoomId(
  placeId: string | null | undefined,
): placeId is RecognitionRoomId {
  return (
    placeId === "evidence-vault" ||
    placeId === "gardens" ||
    placeId === "celebration-room" ||
    placeId === "legacy-studio" ||
    placeId === "gallery-of-firsts"
  );
}

/**
 * Member override wins immediately — no argument, no re-confirm.
 */
export function applyMemberRoomOverride(
  memberChosenRoom: RecognitionRoomId,
): RecognitionRoutingDecision {
  const prompts: Record<RecognitionRoomId, string> = {
    "evidence-vault":
      "You're right. Let's preserve this in your Evidence Vault™.",
    gardens: "You're right. Let's take it to the Celebration Garden™.",
    "celebration-room":
      "You're right. Let's celebrate this in the Celebration Room™.",
    "legacy-studio": "You're right. Let's open Legacy Studio™.",
    "gallery-of-firsts":
      "You're right. Let's look at this in your Hall of Accomplishments™.",
  };
  return {
    suggestedRoomId: memberChosenRoom,
    path: "fast",
    preserveFirst: memberChosenRoom === "evidence-vault",
    reason: "member_override",
    memberPrompt: prompts[memberChosenRoom],
    options: [] as RecognitionFastPathOption[],
  };
}

/**
 * Discovery language inside Evidence Vault must preserve — never Create.
 */
export function shouldBlockCreateRouting(input: {
  trigger: RecognitionTriggerMatch;
  visualRoom: string | null;
  activeFlowKind?: string | null;
}): boolean {
  if (input.activeFlowKind === "preserve_discovery") return true;
  if (input.visualRoom === "evidence-vault" && input.trigger.suggestsPreserve) {
    return true;
  }
  if (input.trigger.matched && input.trigger.suggestsPreserve) {
    return true;
  }
  return false;
}

export function evaluateRecognitionRouting(input: {
  trigger: RecognitionTriggerMatch;
  tone?: RecognitionTone;
  intentionalRoomEntry?: boolean;
}): RecognitionRoutingDecision {
  if (input.trigger.suggestsCelebration) {
    const decision = buildCelebrationChoiceDecision({ tone: input.tone });
    return {
      ...decision,
      suggestedRoomId: resolveContextLockedRoom(decision.suggestedRoomId),
    };
  }
  const decision = buildPreserveFirstDecision({
    tone: input.tone,
    intentionalRoomEntry: input.intentionalRoomEntry,
  });
  return {
    ...decision,
    suggestedRoomId: resolveContextLockedRoom(decision.suggestedRoomId),
  };
}
