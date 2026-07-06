import type {
  OvernightRecommendation,
  ReasonPhasePayload,
  RecommendPhasePayload,
} from "../types";

const SAMPLE_RECOMMENDATIONS: OvernightRecommendation[] = [
  {
    id: "rec-continue-listening-rooms",
    kind: "product",
    title: "Continue Listening Rooms",
    summary: "Highest mission alignment and member impact.",
    missionIds: ["listening-rooms"],
    reasoningId: "reason-lr-priority",
    suggestedAction: "QA estate scene today.",
  },
  {
    id: "rec-workshop-ideas",
    kind: "workshop",
    title: "Decision Fatigue Workshop ideas",
    summary: "Three workshop concepts from member voice.",
    missionIds: ["workshop-series"],
    reasoningId: "reason-workshop-demand",
  },
  {
    id: "rec-newsletter-restart",
    kind: "newsletter",
    title: "Gentle Restart newsletter angle",
    summary: "Align nurture copy to estate scene when ready.",
    missionIds: ["marketing-launch"],
    reasoningId: "reason-nurture",
  },
  {
    id: "rec-ghl-automation",
    kind: "automation",
    title: "GHL nurture when content ready",
    summary: "Automate logistics; protect companion relationship.",
    missionIds: ["marketing-launch"],
    reasoningId: "reason-ghl-auto",
    suggestedAction: "Approve draft when scene screenshots exist.",
  },
  {
    id: "rec-dec-invest-restart",
    kind: "executive-decision",
    title: "Invest in restart experience",
    summary: "Decision vault item needs founder confirmation.",
    missionIds: ["listening-rooms"],
    reasoningId: "reason-dec-restart",
  },
  {
    id: "rec-research-adhd",
    kind: "research",
    title: "Read ADHD restart research summary",
    summary: "124 items condensed; two worth deep read.",
    missionIds: ["listening-rooms"],
    reasoningId: "reason-research",
  },
  {
    id: "rec-feature-voice",
    kind: "feature",
    title: "Voice capture path on mobile",
    summary: "Hands-free capture during overwhelm.",
    missionIds: ["companion"],
    reasoningId: "reason-voice",
  },
  {
    id: "rec-course-micro",
    kind: "course",
    title: "Micro-learning module on choosing",
    summary: "Pairs with decision fatigue workshop theme.",
    missionIds: ["workshop-series"],
    reasoningId: "reason-micro",
  },
  {
    id: "rec-mkt-pinterest",
    kind: "marketing",
    title: "Defer Pinterest until Q4",
    summary: "Interest rising but mission chain first.",
    missionIds: ["postcraft"],
    reasoningId: "reason-pinterest",
  },
  {
    id: "rec-biz-mission-composer",
    kind: "business-improvement",
    title: "Keep mission composer as daily anchor",
    summary: "Founder daily workflow usage confirms value.",
    missionIds: ["founder-studio"],
    reasoningId: "reason-founder-daily",
  },
];

export function runRecommendPhase(input: ReasonPhasePayload): RecommendPhasePayload {
  const relevant = input.items.filter((i) => i.matters);
  const reasoningIds = new Set(relevant.map((r) => r.id));

  const recommendations = SAMPLE_RECOMMENDATIONS.filter(
    (rec) => reasoningIds.has(rec.reasoningId) || rec.kind === "executive-decision" || rec.kind === "product",
  );

  if (recommendations.length === 0) {
    return { recommendations: SAMPLE_RECOMMENDATIONS.slice(0, 4) };
  }

  return { recommendations };
}
