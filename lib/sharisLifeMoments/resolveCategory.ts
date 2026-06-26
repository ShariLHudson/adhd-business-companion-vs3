import type { RealityEmotionalTone } from "@/lib/arrivalExperience/types";
import type { LifeMomentCategory } from "./catalog";

const BRAIN_SLOW_RE =
  /\b(?:brain (?:won'?t|isn'?t) slow|racing thoughts?|can'?t stop thinking|head (?:is|feels) (?:loud|busy)|mentally (?:wired|loud))\b/i;
const WORKING_LONG_RE =
  /\b(?:too long|hours straight|all day at|staring at (?:the )?screen|been at (?:this|my desk)|screen fatigue)\b/i;
const CANT_DECIDE_RE =
  /\b(?:can'?t decide|stuck between|don'?t know which|going back and forth|spinning on (?:this|it)|either way)\b/i;
const ISOLATED_RE =
  /\b(?:isolated|alone|lonely|no one to talk)\b/i;

export function resolveLifeMomentCategory(
  tone: RealityEmotionalTone,
  rawNote?: string,
): LifeMomentCategory | null {
  const text = rawNote?.trim() ?? "";

  if (tone === "grief") return null;

  if (text && CANT_DECIDE_RE.test(text)) return "cant_decide";
  if (text && BRAIN_SLOW_RE.test(text)) return "brain_wont_slow";
  if (text && WORKING_LONG_RE.test(text)) return "working_too_long";
  if (text && ISOLATED_RE.test(text)) return "overwhelmed";

  switch (tone) {
    case "flooded":
      return "overwhelmed";
    case "heavy":
      return "need_encouragement";
    case "low":
      return "overwhelmed";
    case "spark":
    case "celebration":
      return "need_joy";
    case "okay":
      if (text && WORKING_LONG_RE.test(text)) return "working_too_long";
      return null;
    default:
      return null;
  }
}

/** Life moments are earned — not every echo, not day one. */
export function shouldOfferLifeMoment(input: {
  tone: RealityEmotionalTone;
  rawNote?: string;
  sessionVisitIndex: number;
  isFirstMeeting?: boolean;
  continuity?: boolean;
}): boolean {
  if (input.continuity) return false;
  if (input.isFirstMeeting) return false;
  if (input.sessionVisitIndex < 6) return false;
  if (input.tone === "grief") return false;
  if (!resolveLifeMomentCategory(input.tone, input.rawNote)) return false;
  return Math.abs(input.sessionVisitIndex) % 3 === 1;
}
