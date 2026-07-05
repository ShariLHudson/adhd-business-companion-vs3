/**
 * Bridge responder guard — TEMPORARILY DISABLED until conversation engine is stable.
 *
 * The continuity bridge ("Let's stay with what you were just talking about…")
 * must never override direct questions, navigation, development work, or frustration.
 */

import { detectAudioRequest } from "@/lib/audioSuggestions";
import { shouldRouteThroughEstateKernel } from "@/lib/estate/estateKernelGate";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";
import { resolveInformationalKnowledgeLocalReply } from "@/lib/sparkKnowledge/informationalKnowledge";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import {
  buildEmotionalContinuationReply,
  isEmotionalSupportThread,
} from "@/lib/conversation/emotionalDistressRouting";
import { isDevelopmentWorkFrustration } from "@/lib/universalCreation/createFastPath";
import {
  evaluateLibraryConversationReply,
  isLibraryExplorationTurn,
} from "@/lib/estate/libraryConversationIntents";
import { evaluateInRoomConversationReply } from "@/lib/estate/estateInRoomConversationIntents";
import {
  extractSoftPlaceProposal,
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
} from "@/lib/estate/estateMetaNavigation";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import { isRecoveryAssistantLine } from "@/lib/chatFastPath/recoveryDedup";

/** Hard off — re-enable only after conversation engine stability review. */
export const BRIDGE_RESPONDER_DISABLED = true as const;

export const BRIDGE_CONTINUATION_LINE =
  "Let's stay with what you were just talking about — keep going from there." as const;

export const PICK_UP_CONTINUATION_LINE =
  "We can pick up from what we were working on — say the next piece when you're ready." as const;

/** Member wants to capture a list now — not a timed reminder. */
const LIST_CAPTURE_RE =
  /\b(?:make|write|create|need)\s+(?:a\s+)?(?:list|todo|to-?do)|\blist of\b|\bthings i need to do\b|\bbrain dump\b|\bget (?:it|this|everything) (?:out|down)\b/i;

const LIST_WRITE_NOW_RE =
  /\b(?:write|make|create)\s+(?:the\s+)?(?:list|todo|to-?do)\b|\blist\b.*\bright now\b|\bright now\b.*\blist\b/i;

const META_FRUSTRATION_RE =
  /\b(?:why do you keep|why did you keep|why are you(?: still)?|what are you doing|you keep asking|stop asking me that)\b/i;

const DEVELOPMENT_TROUBLESHOOTING_RE =
  /\b(?:want this app to work|app to work|make this work|make sure my chat|chat works?(?:\s+well)?|my chat|(?:app|chat) not working|this (?:app|chat) (?:doesn't|isn't|won't) work|nothing works|this doesn't work|this isn't working|broken again|still broken|in this app|developing this app|getting (?:the )?(?:app|chat|estate) to (?:work|behave|respond)|trying to make (?:the |this |my )?(?:new )?(?:app|chat|companion|spark))\b/i;

const STRATEGY_WORK_RE =
  /\b(?:help (?:me )?(?:with|developing|building|create)|developing a|marketing strategy|business strategy|content strategy)\b/i;

const RESTORATION_PLACE_RE =
  /\b(?:sit by the lake|by the lake|lakeside|reflection pond|hammock|peaceful place|seat at the pond)\b/i;

const DIRECT_QUESTION_RE =
  /^(?:what|why|how|when|where|who|can you|could you|will you|do you|is there|are you)\b/i;

export function isBridgeContinuationResponse(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    trimmed.includes(BRIDGE_CONTINUATION_LINE) ||
    trimmed.includes(PICK_UP_CONTINUATION_LINE) ||
    /\blet's stay with what you were just talking about\b/i.test(trimmed) ||
    /\bwe can pick up from what we were working on\b/i.test(trimmed)
  );
}

export function isListCaptureTurn(userText: string): boolean {
  return LIST_CAPTURE_RE.test(userText.trim());
}

export function isListWriteNowTurn(userText: string): boolean {
  return LIST_WRITE_NOW_RE.test(userText.trim());
}

export function isMetaFrustrationTurn(userText: string): boolean {
  return META_FRUSTRATION_RE.test(userText.trim());
}

export function isDevelopmentTroubleshootingTurn(userText: string): boolean {
  return DEVELOPMENT_TROUBLESHOOTING_RE.test(userText.trim());
}

export function isBridgeResponderBlockedTurn(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;

  const primary = classifyPrimaryConversationTurn({ userText: trimmed });
  if (primary.blockBridgeResponder) return true;

  if (isMetaFrustrationTurn(trimmed)) return true;
  if (isDevelopmentTroubleshootingTurn(trimmed)) return true;
  if (shouldRouteThroughEstateKernel(trimmed)) return true;
  if (RESTORATION_PLACE_RE.test(trimmed)) return true;
  if (detectAudioRequest(trimmed).isAudio) return true;
  if (STRATEGY_WORK_RE.test(trimmed)) return true;
  if (DIRECT_QUESTION_RE.test(trimmed)) return true;
  if (trimmed.includes("?")) return true;
  return false;
}

export function buildMetaFrustrationReply(userText: string): string {
  const t = userText.trim();
  if (/\bwhy do you keep\b/i.test(t)) {
    return "You're right to call that out — I don't want to keep circling. What's the one thing you need from me right now?";
  }
  if (/\bwhat are you doing\b/i.test(t)) {
    return "Fair question — I'm here with you, not running a script. What would actually help in this moment?";
  }
  return "I hear the frustration — let me reset. What do you need from me right now?";
}

export function buildDevelopmentTroubleshootingReply(userText: string): string {
  const t = userText.trim();
  if (/\bchat\b/i.test(t)) {
    return "Making the chat work well is the priority — I hear you. What part isn't behaving the way you need right now?";
  }
  if (/\b(?:app|estate)\b/i.test(t)) {
    return "You were working on getting this to behave — tell me what's breaking for you right now and we'll stay on that.";
  }
  return "Let's stay on what you're building — what's not working the way you need?";
}

export function buildListCaptureFallbackReply(userText: string): string {
  if (isListWriteNowTurn(userText)) {
    return "Got it — let's write it now. What's the first thing you don't want to lose?";
  }
  if (isListCaptureTurn(userText)) {
    return "Let's get that list down — what's the first thing on your mind?";
  }
  return "Let's capture what's in your head — start with whatever feels loudest.";
}

export function buildBlockedTurnFallbackReply(
  userText: string,
  currentPlaceId?: string | null,
  lastAssistantText?: string | null,
): string {
  const trimmed = userText.trim();
  if (
    lastAssistantText?.trim() &&
    isEmotionalSupportThread(trimmed, lastAssistantText)
  ) {
    return buildEmotionalContinuationReply(trimmed, lastAssistantText);
  }
  if (isDevelopmentWorkFrustration(trimmed)) {
    return buildDevelopmentTroubleshootingReply(trimmed);
  }
  if (isListWriteNowTurn(trimmed) || isListCaptureTurn(trimmed)) {
    return buildListCaptureFallbackReply(trimmed);
  }
  if (isMetaFrustrationTurn(trimmed)) {
    return buildMetaFrustrationReply(trimmed);
  }
  if (isDevelopmentTroubleshootingTurn(trimmed)) {
    return buildDevelopmentTroubleshootingReply(trimmed);
  }
  const libraryReply = evaluateLibraryConversationReply(trimmed, currentPlaceId);
  if (libraryReply) return libraryReply;
  const inRoomReply = evaluateInRoomConversationReply(trimmed, currentPlaceId);
  if (inRoomReply) return inRoomReply;
  if (isAnotherRoomRequest(trimmed) || isEstateRoomListOrMapRequest(trimmed)) {
    return "I can suggest a few rooms — or name a place from the Estate map.";
  }
  const softProposal = extractSoftPlaceProposal(trimmed);
  if (softProposal && resolveEstatePlaceIdFromUserText(softProposal)) {
    return "Say the word and we'll go there — or tell me more about what you're looking for.";
  }
  if (shouldRouteThroughEstateKernel(trimmed)) {
    return "I'm still with you — name where you'd like to be and we'll go there.";
  }
  if (RESTORATION_PLACE_RE.test(trimmed)) {
    return "The lake sounds peaceful — I can take you lakeside when you're ready. Want to go there?";
  }
  if (detectAudioRequest(trimmed).isAudio) {
    return "I can help with sound — tell me what kind of atmosphere you're looking for.";
  }
  if (STRATEGY_WORK_RE.test(trimmed)) {
    return "Let's stay on that — what's the first piece you want to figure out?";
  }
  if (isEstateGuideQuestion(trimmed, lastAssistantText)) {
    return formatEstateGuideReply(resolveEstateGuideTurn(trimmed));
  }
  const knowledgeReply = resolveInformationalKnowledgeLocalReply(trimmed);
  if (knowledgeReply) return knowledgeReply;
  if (DIRECT_QUESTION_RE.test(trimmed) || trimmed.includes("?")) {
    if (isLibraryExplorationTurn(trimmed, currentPlaceId)) {
      return (
        evaluateLibraryConversationReply(trimmed, currentPlaceId) ??
        "Tell me what you're curious about and we'll find it on the shelf."
      );
    }
    return "I'm listening — what's your question?";
  }
  return "I'm here — tell me what you need and we'll take it from there.";
}

/**
 * Once a valid assistant reply exists, bridge handlers must not replace it.
 */
export function responseOwnershipBlocksBridge(
  existingAssistantContent: string | undefined | null,
): boolean {
  if (!existingAssistantContent?.trim()) return false;
  if (isRecoveryAssistantLine(existingAssistantContent)) return false;
  if (isBridgeContinuationResponse(existingAssistantContent)) return false;
  return true;
}

export function sanitizeBridgeFromReply(
  text: string,
  userText: string,
  currentPlaceId?: string | null,
): string {
  if (!BRIDGE_RESPONDER_DISABLED) return text;
  if (!isBridgeContinuationResponse(text)) return text;
  return buildBlockedTurnFallbackReply(userText, currentPlaceId);
}
