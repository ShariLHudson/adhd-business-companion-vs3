/**
 * Shared turn recovery classification — correction / rejection / revision / repetition.
 *
 * Used by turn authority consumers to repair or resume rather than restart discovery.
 * Not phrase-specific to any single transcript.
 */

export type TurnRecoveryType =
  | "correction"
  | "rejection"
  | "revision"
  | "repetition"
  | "none";

const CORRECTION_RE =
  /\b(?:actually|i meant|i mean|that(?:'s| is) not (?:right|what i|correct)|you misunderstood|no[,.]?\s+(?:i|write|draft|create|make)|correction:|not (?:a |an |the )?(?:that|this)|wrong (?:tool|room|place|thing))\b/i;

const REJECTION_RE =
  /^(?:no|nope|nah|not now|no thanks|no thank you|skip(?: it)?|pass|don'?t|do not|never mind|not interested)[\s.!?,]*$/i;

const REVISION_RE =
  /\b(?:make (?:it|that|this) (?:shorter|longer|clearer|firmer|softer|warmer|more|less)|shorten|tighten|revise|edit|change (?:the |that |this )?|rewrite|tone (?:it|this) down|more formal|more casual)\b/i;

const REPETITION_RE =
  /\b(?:(?:can you |please |just )?(?:write|draft|create|make|finish|send) (?:it|that|the|my|an?|this)\b|again|same (?:thing|email|draft|request)|i (?:already )?(?:asked|said|told you)|still need|we were (?:writing|creating|drafting))\b/i;

/**
 * Classify how this user turn relates to an interrupted or incomplete task.
 */
export function classifyTurnRecovery(userText: string): TurnRecoveryType {
  const t = userText.trim();
  if (!t) return "none";
  if (REJECTION_RE.test(t)) return "rejection";
  if (REVISION_RE.test(t)) return "revision";
  if (CORRECTION_RE.test(t)) return "correction";
  if (REPETITION_RE.test(t)) return "repetition";
  return "none";
}

/** Recovery types that must repair/resume rather than restart discovery. */
export const REPAIR_OR_RESUME_RECOVERY_TYPES: readonly TurnRecoveryType[] = [
  "correction",
  "rejection",
  "revision",
  "repetition",
];

export function shouldRepairOrResumeTask(
  recoveryType: TurnRecoveryType,
): boolean {
  return (
    recoveryType !== "none" &&
    REPAIR_OR_RESUME_RECOVERY_TYPES.includes(recoveryType)
  );
}

/**
 * After the member declines an optional destination, resume the active task owner.
 */
export function shouldResumeAfterDetourDecline(input: {
  recoveryType: TurnRecoveryType;
  activeCreateSession: boolean;
  createOwnsTurn: boolean;
}): boolean {
  if (!input.activeCreateSession && !input.createOwnsTurn) return false;
  return (
    input.recoveryType === "rejection" ||
    input.recoveryType === "repetition" ||
    input.recoveryType === "correction"
  );
}
