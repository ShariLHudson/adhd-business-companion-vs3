// Founder Ecosystem — Phase 13 Adaptive Response Engine.
// Adjusts HOW Shari responds based on the learned companion profile: more
// questions for brainstormers, faster next steps for action-takers, more
// follow-up for accountability seekers — plus adaptive briefing emphasis.
// Produces guidance for the response layer; never therapeutic. Pure.

import type {
  CompanionProfile,
  ResponseAdaptation,
  ResponseTone,
  SupportStyle,
} from "./companionTypes";

const TONE_BY_SUPPORT: Record<SupportStyle, ResponseTone> = {
  encouragement: "warm",
  "direct-action": "direct",
  brainstorming: "warm",
  accountability: "direct",
  planning: "direct",
  reflection: "reflective",
  education: "warm",
};

const GUIDANCE_BY_SUPPORT: Record<SupportStyle, string[]> = {
  encouragement: [
    "Lead with warmth and reassurance before the next step.",
    "Name one thing that's going well.",
  ],
  "direct-action": [
    "Skip preamble — give the single next step first.",
    "Offer to open the workspace right away.",
  ],
  brainstorming: [
    "Ask one or two open questions before suggesting anything.",
    "Offer a few options rather than a single answer.",
  ],
  accountability: [
    "Restate the commitment and offer to follow up.",
    "Check in on the last thing they said they'd do.",
  ],
  planning: [
    "Help structure the work into ordered steps.",
    "Offer to Time Block the top item.",
  ],
  reflection: [
    "Make space for a short look-back before moving forward.",
    "Mirror what they noticed, lightly.",
  ],
  education: [
    "Explain the why in a sentence before the how.",
    "Point to the in-app tool that teaches it.",
  ],
};

const OPENERS_BY_SUPPORT: Record<SupportStyle, string[]> = {
  encouragement: ["You're closer than it feels.", "Nice — let's build on that."],
  "direct-action": ["Here's the next step:", "Let's move — first thing:"],
  brainstorming: ["What's pulling at you most here?", "Want to think it through together?"],
  accountability: ["Last time you planned to… how did it go?", "Want me to check back on this?"],
  planning: ["Let's lay this out in order.", "Here's a simple plan:"],
  reflection: ["Before we move — what stood out this week?", "How did that sit with you?"],
  education: ["Quick why first:", "Here's how this works:"],
};

export function adaptResponse(profile: CompanionProfile): ResponseAdaptation {
  const support = profile.supportStyle.value;
  return {
    supportStyle: support,
    tone: TONE_BY_SUPPORT[support],
    askMoreQuestions: support === "brainstorming" || support === "reflection",
    giveNextStepFast: support === "direct-action" || support === "planning",
    followUpMore: support === "accountability",
    guidance: GUIDANCE_BY_SUPPORT[support],
    exampleOpeners: OPENERS_BY_SUPPORT[support],
  };
}

// ---- Adaptive briefing emphasis ----------------------------------------
export type BriefingEmphasis = {
  order: ("planning" | "execution" | "opportunity" | "reflection")[];
  lead: string; // the section to lead with
  note: string;
};

/** Tilt the morning briefing toward what motivates this founder. */
export function adaptBriefingEmphasis(profile: CompanionProfile): BriefingEmphasis {
  const planning = profile.planningStyle.value;
  const support = profile.supportStyle.value;
  const motivation = profile.motivationStyle.value;

  if (planning === "planner" || support === "planning")
    return {
      order: ["planning", "execution", "opportunity", "reflection"],
      lead: "planning",
      note: "Leads with planning context — this founder likes structure first.",
    };
  if (support === "direct-action" || motivation === "progress")
    return {
      order: ["execution", "planning", "opportunity", "reflection"],
      lead: "execution",
      note: "Leads with execution — this founder wants the next move.",
    };
  if (planning === "brainstorm-first" || motivation === "novelty")
    return {
      order: ["opportunity", "execution", "planning", "reflection"],
      lead: "opportunity",
      note: "Leads with opportunities — this founder likes to explore first.",
    };
  return {
    order: ["reflection", "execution", "planning", "opportunity"],
    lead: "reflection",
    note: "Opens with a brief reflection — this founder processes before acting.",
  };
}
