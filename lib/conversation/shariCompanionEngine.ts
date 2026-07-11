/**
 * Shari Companion Engine — Emotion Before Instruction (rewrite authority).
 *
 * @see docs/estate/SHARI_COMPANION_ENGINE_REWRITE.md
 * @see docs/EMOTIONAL_FIRST_RESPONSE_SEQUENCE.md
 */


import { buildSparkCompanionHint } from "@/lib/sparkCompanion/buildSparkCompanionHint";
import type { SparkCompanionSessionContext } from "@/lib/sparkCompanion/types";
import { SHARI_ERROR_RECOVERY_LINE } from "./shariCompanionEnginePrompt";

export {
  detectShariBannedPhrases,
  SHARI_BANNED_PHRASE_LABELS,
  SHARI_BANNED_PHRASE_PATTERNS,
  SHARI_CORE_LAW,
  SHARI_COMPANION_ENGINE_PROMPT_BLOCK,
  SHARI_ERROR_RECOVERY_LINE,
} from "./shariCompanionEnginePrompt";

export type ShariCompanionHintInput = SparkCompanionSessionContext & {
  userText: string;
  /** Quiet memory — e.g. member dislikes conflict */
  memberDislikesConflict?: boolean;
  hasSolutionReady?: boolean;
  /** Draft/script ready to offer after emotional grounding */
  taskHelpReady?: boolean;
  overwhelmed?: boolean;
  momentumActive?: boolean;
  currentTurn?: number;
  /** Estate place id — room life-skill hint when available */
  placeId?: string | null;
};

const DIFFICULT_CLIENT_CALL_RE =
  /\b(?:difficult|hard|dread(?:ed|ing)?|don'?t want to|avoid(?:ing)?).{0,40}(?:call|phone)\b|\b(?:call|phone).{0,40}(?:difficult|hard|client|customer|don'?t want)\b/i;

export function isDifficultClientCallRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/\b(?:email|e-mail|letter|message|write|draft|compose)\b/i.test(trimmed)) {
    return false;
  }
  return DIFFICULT_CLIENT_CALL_RE.test(trimmed);
}

export function buildShariErrorRecoveryResponse(
  continuation?: string,
): string {
  const tail =
    continuation?.trim() ||
    "Pick up wherever you left off — I'm still with you.";
  return `${SHARI_ERROR_RECOVERY_LINE} ${tail}`;
}

export function buildDifficultClientCallOpeningReply(): string {
  return [
    "I can see why you don't want to make that call. This isn't just a phone call — it's a boundary conversation, and those can feel awful when you care about people.",
    "You're not trying to be mean. You're trying to be honest about what has to happen for the relationship to keep working.",
    "Let's make this calm and kind, but still clear.",
    "Do you want to talk through what you want to say first, or practice it once with me? I can be the client, and you can just read it through.",
  ].join("\n\n");
}

/**
 * Per-turn hint for companion + estate chat stacks.
 * Delegates to Spark Companion V4 — one orchestrated hint per turn.
 */
export function shariCompanionHintForChat(
  input: ShariCompanionHintInput,
): string | null {
  return buildSparkCompanionHint(input);
}
