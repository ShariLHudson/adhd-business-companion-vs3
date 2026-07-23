import type { AdaptiveConversationalOverride } from "./types";

/**
 * Detect a presentation request for this response only.
 * Never writes permanent preferences.
 */
export function detectAdaptiveConversationalOverride(
  userText: string,
): AdaptiveConversationalOverride | null {
  const t = userText.trim();
  if (!t) return null;

  if (
    /\b(?:give me (?:the )?full detail|full detail|show (?:me )?everything|more detail|don'?t summarize)\b/i.test(
      t,
    )
  ) {
    return {
      forceFullDetail: true,
      reason: "Member asked for full detail this turn.",
    };
  }
  if (
    /\b(?:just (?:the )?summary|summary first|main idea only|keep it short)\b/i.test(
      t,
    )
  ) {
    return {
      forceSummaryFirst: true,
      reason: "Member asked for a shorter summary this turn.",
    };
  }
  if (
    /\b(?:fewer choices|fewer options|show (?:me )?fewer|less choices)\b/i.test(
      t,
    )
  ) {
    return {
      forceFewerChoices: true,
      reason: "Member asked for fewer choices this turn.",
    };
  }
  if (
    /\b(?:one (?:question|step) at a time|one step only|slow(er)? down)\b/i.test(
      t,
    )
  ) {
    return {
      forceOneStep: true,
      reason: "Member asked for one-step pacing this turn.",
    };
  }
  if (/\b(?:give me (?:an )?example|show (?:me )?an example)\b/i.test(t)) {
    return {
      forceMoreExamples: true,
      reason: "Member asked for an example this turn.",
    };
  }

  return null;
}
