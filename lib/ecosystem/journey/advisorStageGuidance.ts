// Founder Ecosystem — Phase 9 advisor ↔ stage integration.
// Each advisor's recommendations shift with the founder's business stage. This
// is the lookup + adjustment layer the board uses so a CEO/Marketing/Sales/
// Operations advisor gives stage-appropriate advice. Pure.

import type {
  AdvisorKey,
  AdvisorStageGuidance,
  BusinessStage,
  FounderJourney,
} from "./journeyTypes";

type Guidance = { recommend: string[]; deprioritize: string[] };

const GUIDANCE: Record<AdvisorKey, Record<BusinessStage, Guidance>> = {
  ceo: {
    idea: {
      recommend: ["Validate demand", "Define the one offer", "Talk to 5 potential buyers"],
      deprioritize: ["Hiring", "Automation", "Branding polish"],
    },
    building: {
      recommend: ["Ship a v1", "Pick one core offer", "Set a launch date"],
      deprioritize: ["Scaling systems", "Team building"],
    },
    launching: {
      recommend: ["Drive first sales", "Focus on one funnel", "Measure conversion"],
      deprioritize: ["New product lines", "Org charts"],
    },
    growing: {
      recommend: ["Amplify what works", "Strengthen operations", "Hire your first help"],
      deprioritize: ["Unproven new bets", "Premature automation"],
    },
    scaling: {
      recommend: ["Delegate fully", "Build leadership layer", "Protect your time"],
      deprioritize: ["Doing execution yourself", "Low-leverage tasks"],
    },
  },
  marketing: {
    idea: {
      recommend: ["Audience research", "Test messaging in conversations"],
      deprioritize: ["Paid ads", "Full content calendar"],
    },
    building: {
      recommend: ["Build a small waitlist", "Share the build in public"],
      deprioritize: ["Big ad spend", "Multi-channel campaigns"],
    },
    launching: {
      recommend: ["One clear funnel", "Consistent lead generation", "Launch campaign"],
      deprioritize: ["Rebranding", "Chasing every platform"],
    },
    growing: {
      recommend: ["Double down on the best channel", "Optimize conversion"],
      deprioritize: ["Unproven channels", "Vanity metrics"],
    },
    scaling: {
      recommend: ["Systematize content", "Hand marketing to a specialist"],
      deprioritize: ["Hands-on posting", "Manual campaigns"],
    },
  },
  sales: {
    idea: {
      recommend: ["Pre-sell to validate", "Have buying conversations"],
      deprioritize: ["CRM setup", "Sales automation"],
    },
    building: {
      recommend: ["Line up beta buyers", "Draft a simple pitch"],
      deprioritize: ["Complex pipelines"],
    },
    launching: {
      recommend: ["Make the ask", "Follow up on leads", "Close first customers"],
      deprioritize: ["Discounting before trying", "Over-engineering offers"],
    },
    growing: {
      recommend: ["Raise prices where earned", "Upsell existing customers"],
      deprioritize: ["Chasing low-fit leads"],
    },
    scaling: {
      recommend: ["Train a salesperson", "Document the sales process"],
      deprioritize: ["Taking every call yourself"],
    },
  },
  operations: {
    idea: {
      recommend: ["Keep it lightweight", "Track learnings simply"],
      deprioritize: ["Heavy tooling", "Process for scale"],
    },
    building: {
      recommend: ["Deliver once manually", "Note what to repeat"],
      deprioritize: ["Automating before validating"],
    },
    launching: {
      recommend: ["Make delivery reliable", "Handle first customers well"],
      deprioritize: ["Over-building infrastructure"],
    },
    growing: {
      recommend: ["Document repeatable processes", "Tighten delivery"],
      deprioritize: ["One-off manual work"],
    },
    scaling: {
      recommend: ["Automate high-volume tasks", "Write SOPs for handoff"],
      deprioritize: ["Staying in day-to-day ops"],
    },
  },
};

export function advisorGuidanceForStage(
  advisor: AdvisorKey,
  stage: BusinessStage,
): AdvisorStageGuidance {
  const g = GUIDANCE[advisor][stage];
  return { advisor, stage, recommend: g.recommend, deprioritize: g.deprioritize };
}

/** All four advisors' guidance for the founder's current stage. */
export function advisorBoardForJourney(journey: FounderJourney): AdvisorStageGuidance[] {
  return (["ceo", "marketing", "sales", "operations"] as AdvisorKey[]).map((a) =>
    advisorGuidanceForStage(a, journey.currentStage),
  );
}

/**
 * Reorder/annotate an advisor's raw recommendation list so stage-appropriate
 * items rise and stage-inappropriate ones are flagged. Pure, non-destructive.
 */
export function adjustAdvisorRecommendations(
  advisor: AdvisorKey,
  stage: BusinessStage,
  recommendations: string[],
): { text: string; fit: "aligned" | "off-stage" | "neutral" }[] {
  const g = GUIDANCE[advisor][stage];
  const aligned = (s: string) =>
    g.recommend.some((r) => overlap(s, r));
  const off = (s: string) => g.deprioritize.some((d) => overlap(s, d));
  return recommendations
    .map((text) => ({
      text,
      fit: aligned(text) ? ("aligned" as const) : off(text) ? ("off-stage" as const) : ("neutral" as const),
    }))
    .sort((a, b) => rank(a.fit) - rank(b.fit));
}

const rank = (f: "aligned" | "off-stage" | "neutral") =>
  f === "aligned" ? 0 : f === "neutral" ? 1 : 2;

function overlap(a: string, b: string): boolean {
  const set = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  for (const w of b.toLowerCase().split(/[^a-z0-9]+/))
    if (w.length > 3 && set.has(w)) return true;
  return false;
}
