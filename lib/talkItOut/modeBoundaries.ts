/**
 * Package 202 — Talk It Out Mode Boundaries & Routing.
 * Reflective conversation stays here; explicit tasks do not auto-launch elsewhere.
 */

export type TioRouteIntent =
  | "reflective"
  | "direct_information"
  | "creation"
  | "planning"
  | "formal_decision"
  | "expert_advice"
  | "navigation"
  | "reminder"
  | "venting"
  | "mixed"
  | "unclear";

export type TioModeBoundaryResult = {
  intent: TioRouteIntent;
  stayInTalkItOut: boolean;
  /** Permission-based offer only — never auto-navigate. */
  transitionOffer: string | null;
  confidence: "high" | "medium" | "low";
};

const DIRECT_INFO =
  /\b(?:what (?:does|is|are)|define|explain what|how (?:do|does) (?:a|an|the)\b)/i;
const CREATION =
  /\b(?:write|draft|create|generate)\b.+\b(?:job description|post|email|script|proposal)\b/i;
const PLANNING =
  /\b(?:make (?:a |me a )?plan|hiring plan|project plan|schedule this|break this into steps)\b/i;
const FORMAL =
  /\b(?:compare|pros and cons|decision matrix|score these)\b/i;
const EXPERT =
  /\b(?:marketing expert|chamber|want (?:an? )?expert(?:'s)? opinion|board(?:room)? (?:opinion|advice))\b/i;
const NAV =
  /\b(?:take me to|open the|go to the|show me the)\b.+\b(?:chamber|board|library|projects|create)\b/i;
const REMINDER =
  /\b(?:remind me|set a reminder|every (?:friday|monday)|rhythm)\b/i;
const VENT =
  /\b(?:just (?:need to )?vent|need to get this out|not looking for (?:advice|answers)|just listen)\b/i;
const REFLECTIVE =
  /\b(?:think through|talk (?:this |it )?through|torn between|not sure what i (?:want|think)|help me (?:sort|untangle|clarify))\b/i;

/**
 * Classify intent for Talk It Out boundary handling.
 * Does not navigate — only informs the reply.
 */
export function classifyTalkItOutIntent(userText: string): TioModeBoundaryResult {
  const t = userText.trim();
  if (!t) {
    return {
      intent: "unclear",
      stayInTalkItOut: true,
      transitionOffer: null,
      confidence: "low",
    };
  }

  if (NAV.test(t)) {
    return {
      intent: "navigation",
      stayInTalkItOut: false,
      transitionOffer: null,
      confidence: "high",
    };
  }
  if (REMINDER.test(t)) {
    return {
      intent: "reminder",
      stayInTalkItOut: false,
      transitionOffer:
        "I can help set that reminder when you are ready — or we can keep talking this through first.",
      confidence: "high",
    };
  }
  if (CREATION.test(t)) {
    return {
      intent: "creation",
      stayInTalkItOut: false,
      transitionOffer:
        "We can draft that when you want. For now we can keep clarifying what the role needs to be, if that would help.",
      confidence: "high",
    };
  }
  if (PLANNING.test(t)) {
    return {
      intent: "planning",
      stayInTalkItOut: false,
      transitionOffer:
        "It sounds like you now want a plan. We can build that next when you are ready — or keep talking until the decision feels clearer.",
      confidence: "high",
    };
  }
  if (FORMAL.test(t)) {
    return {
      intent: "formal_decision",
      stayInTalkItOut: false,
      transitionOffer:
        "We can compare options more formally when you want. We can also keep sorting what matters in the decision here first.",
      confidence: "medium",
    };
  }
  if (EXPERT.test(t)) {
    return {
      intent: "expert_advice",
      stayInTalkItOut: false,
      transitionOffer:
        "We can bring in another perspective when you want one. We can also keep thinking this through together first.",
      confidence: "medium",
    };
  }
  if (VENT.test(t)) {
    return {
      intent: "venting",
      stayInTalkItOut: true,
      transitionOffer: null,
      confidence: "high",
    };
  }
  if (DIRECT_INFO.test(t) && !REFLECTIVE.test(t) && t.length < 120) {
    return {
      intent: "direct_information",
      stayInTalkItOut: false,
      transitionOffer: null,
      confidence: "medium",
    };
  }
  if (REFLECTIVE.test(t) && (CREATION.test(t) || PLANNING.test(t))) {
    return {
      intent: "mixed",
      stayInTalkItOut: true,
      transitionOffer:
        "We can talk through whether this makes sense first, and only create or plan if you decide you want that next.",
      confidence: "medium",
    };
  }

  return {
    intent: "reflective",
    stayInTalkItOut: true,
    transitionOffer: null,
    confidence: REFLECTIVE.test(t) ? "high" : "medium",
  };
}

/** Banned auto-redirect phrases (package 202). */
export const TIO_FORBIDDEN_REDIRECT_LANGUAGE = [
  "You should visit the Strategy Garden",
  "Open Peaceful Places",
  "Launch the Chamber",
  "You need to go to Projects",
] as const;
