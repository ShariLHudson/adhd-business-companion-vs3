import type { SupportStyleId, SupportStyleTemporaryOverride } from "./types";

/**
 * Detect a temporary support request for this turn only.
 * Does not change the saved Support Style preference.
 */
export function detectSupportStyleTemporaryOverride(
  userText: string,
): SupportStyleTemporaryOverride | null {
  const t = userText.trim();
  if (!t) return null;

  if (
    /\b(?:be direct|just be direct|skip (?:the )?reassurance|just tell me what to do|no reassurance)\b/i.test(
      t,
    )
  ) {
    return {
      styleId: "practical-first",
      reason: "Member asked for direct practical help this turn.",
    };
  }
  if (
    /\b(?:just (?:need )?reassurance|only reassurance|i just need comfort)\b/i.test(
      t,
    )
  ) {
    return {
      styleId: "gentle-first",
      reason: "Member asked for reassurance this turn.",
    };
  }
  if (
    /\b(?:give me one step|one step only|just one step|one next step)\b/i.test(t)
  ) {
    return {
      styleId: "step-by-step",
      reason: "Member asked for one step this turn.",
    };
  }
  if (
    /\b(?:let me talk|talk this through|just listen|don'?t fix)\b/i.test(t)
  ) {
    return {
      styleId: "talk-it-through",
      reason: "Member asked to talk it through this turn.",
    };
  }
  if (
    /\b(?:don'?t give me choices|no choices|not choices right now)\b/i.test(t)
  ) {
    return {
      styleId: "practical-first",
      reason: "Member asked not to receive choice menus this turn.",
    };
  }
  if (/\b(?:give me (?:a few )?choices|options please)\b/i.test(t)) {
    return {
      styleId: "give-me-choices",
      reason: "Member asked for choices this turn.",
    };
  }

  return null;
}

export function resolveEffectiveSupportStyleId(
  saved: SupportStyleId,
  override: SupportStyleTemporaryOverride | null,
): SupportStyleId {
  return override?.styleId ?? saved;
}
