/**

 * Coaching fallback — when the model/API cannot respond.

 * Shari stays present — never generic error or AI coaching openers.

 *

 * @see docs/estate/SHARI_COMPANION_ENGINE_REWRITE.md

 */



import {

  buildShariErrorRecoveryResponse,

} from "@/lib/conversation/shariCompanionEngine";

import {

  formatEmotionalFirstOpening,

  planEmotionalFirstResponse,

  shouldUseEmotionalFirstSequence,

} from "@/lib/conversation/emotionalFirstResponseSequence";

import {

  BRIDGE_RESPONDER_DISABLED,

  buildBlockedTurnFallbackReply,

  buildDevelopmentTroubleshootingReply,

  buildMetaFrustrationReply,

  isBridgeContinuationResponse,

  isBridgeResponderBlockedTurn,

  isDevelopmentTroubleshootingTurn,

  isListCaptureTurn,

  isListWriteNowTurn,

  isMetaFrustrationTurn,

  buildListCaptureFallbackReply,

  sanitizeBridgeFromReply,

} from "./bridgeResponderGuard";

import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";



export const COACHING_FALLBACK_LEAD =

  "Something got tangled for a second, but I'm still here." as const;

export const GENERIC_RECOVERY_BRIDGE =
  "I'm here — tell me what you need and we'll take it from there." as const;

export function isGenericRecoveryContinuation(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return (
    t === GENERIC_RECOVERY_BRIDGE ||
    t === "Pick up wherever you left off — I'm still with you." ||
    t === "I'm here — what would help most right now?" ||
    /\bname where you'd like to be\b/i.test(t) ||
    /\btell me what you need and we'll take it from there\b/i.test(t)
  );
}



export type CoachingFallbackKind =

  | "quit_temptation"

  | "prioritization_overload"

  | "development_frustration"

  | "general_emotional";



const QUIT_TEMPTATION_RE =

  /\b(should\s+)?(stop|quit|give up|walk away)\s+(working on|developing|building|on)\b|\bgo back to\s+(making|doing)\b/i;



const PRIORITIZATION_OVERLOAD_RE =

  /\b((\d+|fifteen|several|many)\s+(things|tasks|options|projects).*(important|priority|urgent)|every one of them feels important|too many (things|tasks|priorities))\b/i;



const DEVELOPMENT_FRUSTRATION_RE =

  /\b(?:want this app to work|app to work|make this work|why (?:isn't|won't) this work|nothing works|this doesn't work|broken again|still broken|chat works|chat not working|in this app|make sure my chat)\b/i;



export function classifyCoachingFallbackKind(

  userText: string,

): CoachingFallbackKind {

  const trimmed = userText.trim();

  if (isDevelopmentTroubleshootingTurn(trimmed)) {

    return "development_frustration";

  }

  if (QUIT_TEMPTATION_RE.test(trimmed)) return "quit_temptation";

  if (PRIORITIZATION_OVERLOAD_RE.test(trimmed)) return "prioritization_overload";

  if (DEVELOPMENT_FRUSTRATION_RE.test(trimmed)) return "development_frustration";

  if (

    /\b(overwhelm|scared|afraid|anxious|exhausted|stuck|doubt|important)\b/i.test(

      trimmed,

    )

  ) {

    return "general_emotional";

  }

  return "general_emotional";

}



function gentleQuestionForKind(kind: CoachingFallbackKind): string {

  switch (kind) {

    case "quit_temptation":

      return "What's making stepping away feel like the right move right now?";

    case "prioritization_overload":

      return "If you could only ease one of those today, which would take the most weight off your shoulders?";

    case "development_frustration":

      return buildDevelopmentTroubleshootingReply("app not working");

    default:

      return "What feels most true for you in this moment?";

  }

}



export type RuntimeRecoveryInput = {

  userText?: string;

  lastAssistantText?: string | null;

  priorUserText?: string | null;

};



export function resolveRecoveryContinuation(input: RuntimeRecoveryInput): string {

  const userText = input.userText?.trim() ?? "";

  if (!userText) {

    return "Pick up wherever you left off — I'm still with you.";

  }

  if (isEstateGuideQuestion(userText)) {

    return formatEstateGuideReply(resolveEstateGuideTurn(userText));

  }



  if (BRIDGE_RESPONDER_DISABLED || isBridgeResponderBlockedTurn(userText)) {

    if (isMetaFrustrationTurn(userText)) {

      return buildMetaFrustrationReply(userText);

    }

    if (isDevelopmentTroubleshootingTurn(userText)) {

      return buildDevelopmentTroubleshootingReply(userText);

    }

    if (isBridgeResponderBlockedTurn(userText)) {

      return buildBlockedTurnFallbackReply(userText);

    }

  }



  const kind = classifyCoachingFallbackKind(userText);

  if (kind === "development_frustration") {

    return gentleQuestionForKind(kind);

  }



  if (kind === "quit_temptation" || kind === "prioritization_overload") {

    return gentleQuestionForKind(kind);

  }



  if (

    !BRIDGE_RESPONDER_DISABLED &&

    shouldUseEmotionalFirstSequence(userText) &&

    !isBridgeResponderBlockedTurn(userText)

  ) {

    return gentleQuestionForKind("general_emotional");

  }



  if (!BRIDGE_RESPONDER_DISABLED && input.priorUserText?.trim()) {

    return "Let's stay with what you were just talking about — keep going from there.";

  }



  if (BRIDGE_RESPONDER_DISABLED) {

    if (isListWriteNowTurn(userText) || isListCaptureTurn(userText)) {

      return buildListCaptureFallbackReply(userText);

    }

    const prior = input.priorUserText?.trim() ?? "";

    if (isListWriteNowTurn(prior) || isListCaptureTurn(prior)) {

      return buildListCaptureFallbackReply(userText || prior);

    }

    const kind = classifyCoachingFallbackKind(userText);

    if (kind === "prioritization_overload" || kind === "quit_temptation") {

      return gentleQuestionForKind(kind);

    }

    return GENERIC_RECOVERY_BRIDGE;

  }



  if (input.lastAssistantText?.trim()) {

    return "We can pick up from what we were working on — say the next piece when you're ready.";

  }



  return "Say that again in your own words — I'll pick up from there.";

}



/** Genuine runtime failure — once per turn, never generic coaching by default. */

export function buildRuntimeRecoveryResponse(input: RuntimeRecoveryInput): string {

  const userText = input.userText?.trim() ?? "";

  if (userText && shouldUseEmotionalFirstSequence(userText)) {

    const plan = planEmotionalFirstResponse({ text: userText });

    const opening = formatEmotionalFirstOpening(plan);

    if (opening) {

      return opening;

    }

  }

  const continuation = resolveRecoveryContinuation(input);

  if (
    isGenericRecoveryContinuation(continuation) ||
    isBridgeContinuationResponse(continuation)
  ) {
    return COACHING_FALLBACK_LEAD;
  }

  return `${COACHING_FALLBACK_LEAD} ${continuation}`;

}



/** Model/API empty response — contextual reply without runtime recovery lead. */

export function buildContextualChatFallback(

  input: RuntimeRecoveryInput,

): string {

  return sanitizeBridgeFromReply(resolveRecoveryContinuation(input), input.userText ?? "");

}



export function buildCoachingFallbackResponse(

  userText: string,

  memory?: Pick<RuntimeRecoveryInput, "lastAssistantText" | "priorUserText">,

): string {

  return buildContextualChatFallback({

    userText,

    lastAssistantText: memory?.lastAssistantText,

    priorUserText: memory?.priorUserText,

  });

}



export function isCoachingFallbackNeeded(

  message: string,

  finishReason?: string | null,

): boolean {

  if (!message.trim()) return true;

  if (finishReason === "content_filter") return true;

  return false;

}



export { isBridgeContinuationResponse };


