import type { GuestArrivalMode } from "./types";

const COME_TO_WORK_RE =
  /\b(?:help me (?:write|create|build|make|draft|design|develop|generate|organize)|write (?:me )?(?:an? )?|create (?:an? )?|build (?:an? )?|let'?s (?:build|brainstorm|do it|write|create)|i need (?:an? )?(?:email|sop|funnel|spreadsheet|post|checklist)|(?:sales|marketing|lead(?:\s+generation)?|email|webinar|launch)\s+funnel|marketing (?:plan|funnel)|facebook post|pinterest (?:description|post)|brainstorm|organize my launches|client onboarding|standard operating|spreadsheet)\b/i;

const COME_TO_BE_HELPED_RE =
  /\b(?:i'?m overwhelmed|i feel overwhelmed|don'?t (?:even )?know where to start|not sure where to start|my brain won'?t slow down|brain (?:is|won'?t) (?:spinning|slow)|i'?m stuck|i need to think|i'?m discouraged|what'?s wrong(?: today)?|don'?t know what'?s wrong|feel(?:ing)? (?:alone|lost|discouraged|stuck)|can'?t (?:focus|slow down)|everything feels (?:heavy|hard)|need (?:someone|help thinking))\b/i;

const EMERGENT_NEED_RE =
  /\b(?:don'?t (?:even )?know why i'?m|lost (?:motivation|interest|steam)|why am i even|what'?s wrong today|don'?t know why i'?m doing|not sure this (?:matters|is worth)|questioning everything)\b/i;

const VAGUE_ARRIVAL_RE =
  /^(?:help(?: me)?|i need help|hi|hello|hey)\.?$/i;

/**
 * Classify why the guest walked through the door.
 */
export function resolveGuestArrivalMode(input: {
  userText?: string | null;
  overwhelmed?: boolean;
}): GuestArrivalMode {
  const text = input.userText?.trim() ?? "";
  if (!text) {
    return input.overwhelmed ? "come_to_be_helped" : "unclear";
  }

  if (COME_TO_BE_HELPED_RE.test(text)) return "come_to_be_helped";
  if (COME_TO_WORK_RE.test(text)) return "come_to_work";
  if (input.overwhelmed && !COME_TO_WORK_RE.test(text)) return "come_to_be_helped";
  if (VAGUE_ARRIVAL_RE.test(text)) return "unclear";

  return "unclear";
}

export function detectEmergentNeed(userText?: string | null): boolean {
  const text = userText?.trim() ?? "";
  if (!text) return false;
  return EMERGENT_NEED_RE.test(text);
}

/** Bridge to Companion Relationship™ visit intent */
export function mapArrivalModeToVisitIntent(
  mode: GuestArrivalMode,
): "work_now" | "linger" | "neutral" {
  if (mode === "come_to_work") return "work_now";
  if (mode === "come_to_be_helped") return "linger";
  return "neutral";
}
