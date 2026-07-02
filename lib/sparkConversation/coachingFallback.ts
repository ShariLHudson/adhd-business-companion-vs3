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

export const COACHING_FALLBACK_LEAD =
  "Something got tangled for a second, but I'm still here." as const;

export type CoachingFallbackKind =
  | "quit_temptation"
  | "prioritization_overload"
  | "general_emotional";

const QUIT_TEMPTATION_RE =
  /\b(should\s+)?(stop|quit|give up|walk away)\s+(working on|developing|building|on)\b|\bgo back to\s+(making|doing)\b/i;

const PRIORITIZATION_OVERLOAD_RE =
  /\b((\d+|fifteen|several|many)\s+(things|tasks|options|projects).*(important|priority|urgent)|every one of them feels important|too many (things|tasks|priorities))\b/i;

export function classifyCoachingFallbackKind(
  userText: string,
): CoachingFallbackKind {
  const trimmed = userText.trim();
  if (QUIT_TEMPTATION_RE.test(trimmed)) return "quit_temptation";
  if (PRIORITIZATION_OVERLOAD_RE.test(trimmed)) return "prioritization_overload";
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
    default:
      return "What feels most true for you in this moment?";
  }
}

export function buildCoachingFallbackResponse(userText: string): string {
  const trimmed = userText.trim();
  if (shouldUseEmotionalFirstSequence(trimmed)) {
    const plan = planEmotionalFirstResponse({ text: trimmed });
    const opening = formatEmotionalFirstOpening(plan);
    if (opening) {
      return `${buildShariErrorRecoveryResponse(gentleQuestionForKind(classifyCoachingFallbackKind(trimmed)))}\n\n${opening}`;
    }
  }
  return buildShariErrorRecoveryResponse(
    gentleQuestionForKind(classifyCoachingFallbackKind(trimmed)),
  );
}

export function isCoachingFallbackNeeded(
  message: string,
  finishReason?: string | null,
): boolean {
  if (!message.trim()) return true;
  if (finishReason === "content_filter") return true;
  return false;
}
