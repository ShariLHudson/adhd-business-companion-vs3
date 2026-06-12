// Founder Ecosystem — Phase 10 Founder Recommendation Engine.
// Composes the journey (stage + focus), the operating state (capacity, next
// actions, priorities), the advisor board and the business profile into
// concrete, linked, stage-appropriate recommendations — with energy/time
// awareness and a no-projects fallback. Observational only; never therapeutic
// or legal. Pure.

import type { FounderEvent, ID } from "../events";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import { advisorBoardForJourney } from "../journey/advisorStageGuidance";
import type { FounderFocus } from "../journey/journeyTypes";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import type {
  ActionLink,
  AdvisorNote,
  AssistedAction,
  FounderRecommendations,
  Level,
  Recommendation,
  RecommendationCategory,
  RecommendationContext,
  TimeAllocationSlice,
} from "./recommendationTypes";

const ENERGY_MINUTES: Record<Level, number> = { low: 40, medium: 75, high: 120 };
const round5 = (n: number) => Math.round(n / 5) * 5;

// What "doing the focus" looks like — the link + optional assisted draft.
const FOCUS_PLAY: Record<
  FounderFocus,
  {
    category: RecommendationCategory;
    minutes: number;
    link: (ctx: RecommendationContext) => ActionLink;
    assisted?: AssistedAction;
  }
> = {
  marketing: {
    category: "marketing",
    minutes: 30,
    link: () => ({ target: "create", label: "Open Create to draft a post", ref: "create" }),
    assisted: {
      kind: "social-post",
      prompt: "Draft a short post that speaks to your audience's main problem",
      link: { target: "create", label: "Draft with Shari", ref: "create" },
    },
  },
  content: {
    category: "content",
    minutes: 30,
    link: () => ({ target: "create", label: "Open Create to write content", ref: "create" }),
    assisted: {
      kind: "outline",
      prompt: "Outline one piece of content around a question customers ask",
      link: { target: "create", label: "Outline with Shari", ref: "create" },
    },
  },
  sales: {
    category: "sales",
    minutes: 25,
    link: () => ({ target: "create", label: "Draft an outreach email", ref: "create" }),
    assisted: {
      kind: "email-draft",
      prompt: "Draft a warm follow-up email to a lead who went quiet",
      link: { target: "create", label: "Draft email with Shari", ref: "create" },
    },
  },
  operations: {
    category: "operations",
    minutes: 45,
    link: (ctx) =>
      ctx.googleConnected
        ? { target: "google-doc", label: "Create an SOP in Google Docs", requiresConnection: "google" }
        : { target: "create", label: "Draft an SOP in Create", ref: "create" },
    assisted: {
      kind: "sop",
      prompt: "Turn the step you keep repeating into a simple SOP",
      link: { target: "create", label: "Write SOP with Shari", ref: "create" },
    },
  },
  systems: {
    category: "systems",
    minutes: 40,
    link: () => ({ target: "google-sheet", label: "Set up a tracking sheet", requiresConnection: "google" }),
    assisted: {
      kind: "checklist",
      prompt: "List the repeatable steps so they can be automated later",
      link: { target: "create", label: "Build checklist with Shari", ref: "create" },
    },
  },
  "product-creation": {
    category: "product",
    minutes: 60,
    link: () => ({ target: "workspace", label: "Open a Focus Session to build", ref: "focus-session" }),
  },
  "customer-success": {
    category: "operations",
    minutes: 25,
    link: () => ({ target: "create", label: "Draft a check-in message", ref: "create" }),
    assisted: {
      kind: "email-draft",
      prompt: "Write a quick check-in to a current customer for feedback",
      link: { target: "create", label: "Draft with Shari", ref: "create" },
    },
  },
  leadership: {
    category: "systems",
    minutes: 30,
    link: (ctx) =>
      ctx.googleConnected
        ? { target: "google-doc", label: "Write a delegation brief", requiresConnection: "google" }
        : { target: "create", label: "Draft a delegation brief", ref: "create" },
    assisted: {
      kind: "sop",
      prompt: "Document one responsibility clearly enough to hand off",
      link: { target: "create", label: "Write handoff with Shari", ref: "create" },
    },
  },
};

const hasDocForProject = (events: FounderEvent[], projectId?: ID) =>
  !!projectId &&
  events.some((e) => e.type === "document.created" && e.refs?.projectId === projectId);

let idSeq = 0;
const rid = (prefix: string) => `rec:${prefix}:${++idSeq}`;

function smallStep(minutes: number, energy: Level): number {
  if (energy === "low") return Math.min(minutes, 25);
  if (energy === "medium") return Math.min(minutes, 60);
  return minutes;
}

export function getFounderRecommendations(
  events: FounderEvent[],
  founderId: ID,
  ctx: RecommendationContext = {},
): FounderRecommendations {
  idSeq = 0;
  const now = ctx.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);

  const journey = detectFounderJourney(mine, founderId, { now, profile: ctx.profile });
  const os = getFounderOperatingState(mine, founderId, { now });

  const energy: Level = ctx.energy ?? os.capacity.energy;
  const availableMinutes = ctx.availableMinutes ?? ENERGY_MINUTES[energy];
  const primaryFocus = journey.primaryFocus;
  const hasProjects = os.projectHealth.length > 0;

  const recommendations: Recommendation[] = [];

  // 1) FOCUS TODAY — the stage's top play, dressed with a concrete link.
  const topJourney = journey.recommendations[0];
  if (topJourney) {
    const play = FOCUS_PLAY[topJourney.focus];
    recommendations.push({
      id: rid("focus"),
      title: topJourney.text,
      rationale: topJourney.reason,
      category: "focus-today",
      focus: topJourney.focus,
      priority: 92,
      estimatedMinutes: smallStep(play?.minutes ?? 30, energy),
      links: play ? [play.link(ctx)] : [],
      assisted: play?.assisted,
      avoid: topJourney.avoid,
      source: "journey",
    });
  }

  // 2) NEXT ACTION — from the operating state. Respect existing work:
  //    if there's an open task, continue it rather than start something new.
  if (os.nextAction) {
    const na = os.nextAction;
    const continuing = na.type === "finish-task" || na.type === "address-risk";
    const link: ActionLink = continuing
      ? { target: "project", label: "Open the project", ref: na.projectId }
      : na.type === "schedule-focus"
        ? { target: "workspace", label: "Start a Focus Session", ref: "focus-session" }
        : { target: "project", label: "Open the project", ref: na.projectId };
    recommendations.push({
      id: rid("next"),
      title: na.action,
      rationale: na.rationale,
      category: "next-action",
      focus: primaryFocus,
      priority: 88,
      estimatedMinutes: smallStep(continuing ? 30 : 25, energy),
      links: hasDocForProject(mine, na.projectId)
        ? [link, { target: "google-doc", label: "Open the related doc" }]
        : [link],
      source: "operating-state",
    });
  }

  // 3) ADVISOR-DRIVEN — one stage-appropriate item from the marketing/sales
  //    advisor matching the founder's focus.
  const board = advisorBoardForJourney(journey);
  const advisorFocusMap: Record<string, FounderFocus> = {
    marketing: "marketing",
    sales: "sales",
    operations: "operations",
  };
  for (const g of board) {
    if (g.advisor === "ceo") continue;
    const f = advisorFocusMap[g.advisor];
    const isPrimary = f === primaryFocus;
    const rec = g.recommend[0];
    if (!rec) continue;
    const play = FOCUS_PLAY[f];
    recommendations.push({
      id: rid(g.advisor),
      title: rec,
      rationale: `${g.advisor[0].toUpperCase()}${g.advisor.slice(1)} advisor for the ${journey.currentStage} stage.`,
      category: play.category,
      focus: f,
      priority: isPrimary ? 70 : 52,
      estimatedMinutes: smallStep(play.minutes, energy),
      links: [play.link(ctx)],
      assisted: play.assisted,
      source: "advisor",
    });
  }

  // 4) FALLBACK — no projects yet: give the stage's first concrete step.
  if (!hasProjects) {
    recommendations.length = 0; // ignore project-derived items
    if (topJourney) {
      const play = FOCUS_PLAY[topJourney.focus];
      recommendations.push({
        id: rid("fallback"),
        title: `Start here: ${topJourney.text}`,
        rationale: "You don't have an active project yet — this is the first move.",
        category: "focus-today",
        focus: topJourney.focus,
        priority: 95,
        estimatedMinutes: smallStep(play?.minutes ?? 25, energy),
        links: [
          { target: "project", label: "Create your first project", ref: "new-project" },
          ...(play ? [play.link(ctx)] : []),
        ],
        assisted: play?.assisted,
        avoid: topJourney.avoid,
        source: "fallback",
      });
    }
  }

  // GHL: if connected, attach a workflow trigger to a marketing/sales recommendation.
  if (ctx.ghlConnected) {
    const target = recommendations.find(
      (r) =>
        r.category === "marketing" ||
        r.category === "sales" ||
        (r.focus === "marketing" || r.focus === "sales"),
    );
    target?.links.push({
      target: "ghl-workflow",
      label: "Trigger the GHL nurture workflow",
      requiresConnection: "ghl",
    });
  }

  // Energy-aware ordering: at low energy, big tasks sink.
  recommendations.sort((a, b) => {
    const pa = a.priority - (energy === "low" && a.estimatedMinutes > 30 ? 18 : 0);
    const pb = b.priority - (energy === "low" && b.estimatedMinutes > 30 ? 18 : 0);
    return pb - pa;
  });

  return {
    founderId,
    generatedAt: now.toISOString(),
    stage: journey.currentStage,
    primaryFocus,
    energy,
    availableMinutes,
    headline: buildHeadline(journey.currentStage, primaryFocus, energy),
    recommendations,
    timeAllocation: allocateTime(availableMinutes, primaryFocus, journey.secondaryFocus),
    advisorNotes: buildAdvisorNotes(journey, os),
    alerts: [
      ...os.risks.map((r) => ({ kind: "risk" as const, label: r.label })),
      ...os.opportunities
        .filter((o) => o.impact === "high")
        .map((o) => ({ kind: "opportunity" as const, label: o.text })),
    ],
    hasProjects,
  };
}

function buildHeadline(stage: string, focus: FounderFocus | null, energy: Level): string {
  const f = focus ? focus.replace("-", " ") : "what moves the needle";
  const e = energy === "low" ? " Keep it small today." : "";
  return `You're in the ${stage} stage — focus on ${f}.${e}`;
}

function allocateTime(
  minutes: number,
  primary: FounderFocus | null,
  secondary: FounderFocus | null,
): TimeAllocationSlice[] {
  const slices: TimeAllocationSlice[] = [];
  if (primary) slices.push({ label: `Primary: ${primary}`, minutes: round5(minutes * 0.5), focus: primary });
  if (secondary)
    slices.push({ label: `Secondary: ${secondary}`, minutes: round5(minutes * 0.3), focus: secondary });
  slices.push({ label: "Buffer / reset", minutes: round5(minutes * (secondary ? 0.2 : 0.5)), focus: "rest" });
  return slices;
}

function buildAdvisorNotes(
  journey: ReturnType<typeof detectFounderJourney>,
  os: ReturnType<typeof getFounderOperatingState>,
): AdvisorNote[] {
  const notes: AdvisorNote[] = [];
  const board = advisorBoardForJourney(journey);
  const ceo = board.find((b) => b.advisor === "ceo");
  if (ceo)
    notes.push({
      advisor: "ceo",
      kind: "guidance",
      note: `At the ${journey.currentStage} stage: ${ceo.recommend.join(", ")}. Skip ${ceo.deprioritize.join(", ").toLowerCase()}.`,
    });
  for (const b of board) {
    if (b.advisor === "ceo") continue;
    notes.push({
      advisor: b.advisor,
      kind: "guidance",
      note: b.recommend[0],
    });
  }
  // Productivity advisor = capacity + accountability, never therapeutic.
  notes.push({
    advisor: "productivity",
    kind: "accountability",
    note:
      os.capacity.level === "low"
        ? "Capacity looks low — pick one small step and stop there. That still counts."
        : `Momentum is ${os.momentum.direction}. Protect one focus block to keep it going.`,
  });
  for (const r of os.risks.slice(0, 1))
    notes.push({ advisor: "ceo", kind: "risk", note: r.label });
  for (const o of os.opportunities.filter((x) => x.impact === "high").slice(0, 1))
    notes.push({ advisor: "ceo", kind: "opportunity", note: o.text });
  return notes;
}
