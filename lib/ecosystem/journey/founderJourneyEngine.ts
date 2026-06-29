// Founder Ecosystem — Phase 9 Founder Journey Engine.
// Member experience stages: docs/FOUNDER_JOURNEY_FRAMEWORK.md (T-010 Dream→Legacy).
// Detects where the founder is in their business journey (idea → scaling), what
// they're focused on, and what matters most at that stage — so every other
// layer can personalize. Derived from the event stream + optional business
// profile. Pure. Business/productivity only — never a clinical claim.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { eventText } from "../intelligence/signals";
import type {
  BusinessStage,
  FocusScore,
  FounderFocus,
  FounderJourney,
  JourneyRecommendation,
  Level,
  StageScore,
} from "./journeyTypes";
import { STAGE_ORDER } from "./journeyTypes";

// ---- Optional business profile input -----------------------------------
export type BusinessProfileInput = {
  stageHint?: BusinessStage;
  hasRevenue?: boolean;
  monthlyRevenue?: number;
  teamSize?: number;
  hasProduct?: boolean;
  hasAudience?: boolean;
};

// ---- Stage signal vocabulary -------------------------------------------
const STAGE_RE: Record<BusinessStage, RegExp> = {
  idea: /\b(idea|validat|brainstorm|concept|explore|niche|offer idea|figure out|should i|what to (build|sell)|research the market)\b/i,
  building: /\b(build|building|create|creating|product|system|website|landing page|draft|sop|set up|develop|design)\b/i,
  launching: /\b(launch|funnel|audience|lead|leads|first sale|email list|promote|campaign|waitlist|go live|open cart)\b/i,
  growing: /\b(revenue|grow|growing|expand|hire|hiring|team|operations|upsell|increase sales|retention|profit)\b/i,
  scaling: /\b(delegat|automat|leadership|systemi[sz]|outsource|manager|standard operating|hand off|scale the team|ops lead)\b/i,
};

const FOCUS_RE: Record<FounderFocus, RegExp> = {
  marketing: /\b(marketing|funnel|audience|reach|seo|ads?|campaign|newsletter|social|brand)\b/i,
  sales: /\b(sales|sell|close|pitch|proposal|lead|prospect|outreach|follow ?up|invoice|client call)\b/i,
  operations: /\b(operation|process|workflow|admin|logistics|fulfil|backend|bookkeep)\b/i,
  "product-creation": /\b(product|offer|feature|build the|develop|prototype|mvp|course|deliverable)\b/i,
  systems: /\b(system|automat|sop|standard operating|template|tool|integrat|pipeline)\b/i,
  content: /\b(content|blog|post|video|newsletter|write|caption|script|reel)\b/i,
  "customer-success": /\b(customer|client|onboard|support|retention|success|feedback|testimonial)\b/i,
  leadership: /\b(team|hire|delegat|manage|leader|culture|vision|board)\b/i,
};

const clampScore = (n: number) => Math.max(0, n);

function scoreStages(
  events: FounderEvent[],
  profile?: BusinessProfileInput,
): StageScore[] {
  const scores: Record<BusinessStage, number> = {
    idea: 0,
    building: 0,
    launching: 0,
    growing: 0,
    scaling: 0,
  };
  const signals: Record<BusinessStage, Set<string>> = {
    idea: new Set(),
    building: new Set(),
    launching: new Set(),
    growing: new Set(),
    scaling: new Set(),
  };

  for (const e of events) {
    const text = eventText(e);
    if (!text) continue;
    for (const stage of STAGE_ORDER) {
      const m = text.match(STAGE_RE[stage]);
      if (m) {
        scores[stage] += 2;
        signals[stage].add(m[0].toLowerCase());
      }
    }
  }

  // Structural signals from event types.
  const exported = events.filter((e) => e.type === "document.exported").length;
  const completed = events.filter((e) => e.type === "project.completed").length;
  if (exported > 0) {
    scores.launching += Math.min(exported, 4);
    signals.launching.add("shipped work");
  }
  if (completed > 0) {
    scores.growing += Math.min(completed, 3) * 2;
    signals.growing.add("completed projects");
  }

  // Business profile boosts.
  if (profile) {
    if (profile.stageHint) {
      scores[profile.stageHint] += 6;
      signals[profile.stageHint].add("profile stage");
    }
    if (profile.hasProduct) {
      scores.building += 3;
      scores.launching += 2;
      signals.building.add("has a product");
    }
    if (profile.hasAudience) {
      scores.launching += 4;
      signals.launching.add("has an audience");
    }
    if (profile.hasRevenue) {
      scores.launching += 3;
      scores.growing += 3;
      signals.growing.add("generating revenue");
    }
    if ((profile.monthlyRevenue ?? 0) > 2000) {
      scores.growing += 5;
      signals.growing.add("steady revenue");
    }
    if ((profile.monthlyRevenue ?? 0) > 10000) {
      scores.scaling += 6;
      signals.scaling.add("strong revenue");
    }
    if ((profile.teamSize ?? 0) >= 1) {
      scores.growing += 4;
      signals.growing.add("has help");
    }
    if ((profile.teamSize ?? 0) >= 3) {
      scores.scaling += 6;
      signals.scaling.add("leading a team");
    }
  }

  // Rank by score; break ties toward the MORE ADVANCED stage — when evidence
  // equally supports two adjacent stages, the founder has usually progressed.
  const ranked: StageScore[] = STAGE_ORDER.map((stage) => ({
    stage,
    score: clampScore(scores[stage]),
    signals: [...signals[stage]],
  }));
  return ranked.sort(
    (a, b) =>
      b.score - a.score ||
      STAGE_ORDER.indexOf(b.stage) - STAGE_ORDER.indexOf(a.stage),
  );
}

function scoreFocus(events: FounderEvent[]): FocusScore[] {
  const scores = new Map<FounderFocus, number>();
  for (const e of events) {
    const text = eventText(e);
    if (!text) continue;
    for (const focus of Object.keys(FOCUS_RE) as FounderFocus[])
      if (FOCUS_RE[focus].test(text)) scores.set(focus, (scores.get(focus) ?? 0) + 1);
  }
  return [...scores.entries()]
    .map(([focus, score]) => ({ focus, score }))
    .sort((a, b) => b.score - a.score);
}

const confidenceFromGap = (top: number, second: number): Level => {
  if (top === 0) return "low";
  const gap = top - second;
  return gap >= 4 ? "high" : gap >= 2 ? "medium" : "low";
};

// ---- Stage playbook: what matters (and what to skip) -------------------
const STAGE_PLAYBOOK: Record<BusinessStage, JourneyRecommendation[]> = {
  idea: [
    {
      text: "Validate the idea with 5 real conversations before building anything",
      focus: "sales",
      reason: "At the idea stage, proof of demand matters more than polish.",
      avoid: "automation, logos, or perfecting the website",
    },
    {
      text: "Write a one-sentence offer and test if people want it",
      focus: "product-creation",
      reason: "A crisp offer is the fastest way to learn if there's a business here.",
      avoid: "building features no one has asked for",
    },
  ],
  building: [
    {
      text: "Ship a minimal version of the product, not the perfect one",
      focus: "product-creation",
      reason: "Building stage rewards a shippable v1 you can put in front of people.",
      avoid: "endless polishing before anyone sees it",
    },
    {
      text: "Set up only the systems you need to deliver once",
      focus: "systems",
      reason: "Just-enough systems keep you moving without over-engineering.",
      avoid: "complex automation for volume you don't have yet",
    },
  ],
  launching: [
    {
      text: "Put the offer in front of an audience and ask for the first sale",
      focus: "marketing",
      reason: "Launching is about traffic → leads → first paying customers.",
      avoid: "rebuilding the product instead of selling it",
    },
    {
      text: "Build one simple funnel and drive consistent leads to it",
      focus: "sales",
      reason: "A single working funnel beats five half-built ones.",
      avoid: "redesigning the brand mid-launch",
    },
  ],
  growing: [
    {
      text: "Double down on the channel already producing revenue",
      focus: "marketing",
      reason: "Growing means amplifying what works, not chasing new shiny channels.",
      avoid: "starting unproven new offers before the core one is solid",
    },
    {
      text: "Tighten operations so delivery scales without you burning out",
      focus: "operations",
      reason: "Smooth delivery protects growth from collapsing under demand.",
      avoid: "manual one-off processes that don't repeat",
    },
  ],
  scaling: [
    {
      text: "Delegate a recurring responsibility fully, with a clear SOP",
      focus: "leadership",
      reason: "Scaling is won by handing off work, not doing more of it yourself.",
      avoid: "low-leverage tasks like logo tweaks or inbox sorting",
    },
    {
      text: "Automate or systematize the highest-volume repeated task",
      focus: "systems",
      reason: "Automation at scale frees your time for leadership.",
      avoid: "staying in the weeds of day-to-day execution",
    },
  ],
};

function buildRecommendations(
  stage: BusinessStage,
  primaryFocus: FounderFocus | null,
): JourneyRecommendation[] {
  const base = STAGE_PLAYBOOK[stage];
  if (!primaryFocus) return base;
  // Surface the recommendation matching the founder's focus first.
  return base
    .slice()
    .sort((a, b) =>
      a.focus === primaryFocus ? -1 : b.focus === primaryFocus ? 1 : 0,
    );
}

export type JourneyOptions = {
  now?: Date;
  profile?: BusinessProfileInput;
  intel?: FounderIntelligence;
};

export function detectFounderJourney(
  events: FounderEvent[],
  founderId: ID,
  opts: JourneyOptions = {},
): FounderJourney {
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());

  const stageScores = scoreStages(mine, opts.profile);
  const currentStage = stageScores[0]?.score ? stageScores[0].stage : "idea";
  const confidence = confidenceFromGap(
    stageScores[0]?.score ?? 0,
    stageScores[1]?.score ?? 0,
  );

  // Previous stage: detect on the earlier ~60% of the timeline.
  const sorted = mine.slice().sort((a, b) => (a.ts < b.ts ? -1 : 1));
  const earlier = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.6)));
  const earlierStage = scoreStages(earlier, opts.profile)[0];
  const previousStage =
    earlierStage && earlierStage.score > 0 && earlierStage.stage !== currentStage
      ? earlierStage.stage
      : null;

  const focusScores = scoreFocus(mine);
  const primaryFocus = focusScores[0]?.score ? focusScores[0].focus : null;
  const secondaryFocus = focusScores[1]?.score ? focusScores[1].focus : null;

  const currentRisks = intel.risks.map((r) => r.label);
  const currentChallenges = intel.patterns
    .filter((p) =>
      ["procrastination-language", "unfinished-tasks", "project-switching", "focus-abandonment"].includes(
        p.type,
      ),
    )
    .map((p) => p.label);
  const currentOpportunities = intel.opportunities.map((o) => o.text);

  return {
    founderId,
    generatedAt: now.toISOString(),
    currentStage,
    previousStage,
    confidence,
    stageScores,
    primaryFocus,
    secondaryFocus,
    focusScores,
    currentChallenges,
    currentOpportunities,
    currentRisks,
    recommendations: buildRecommendations(currentStage, primaryFocus),
  };
}
