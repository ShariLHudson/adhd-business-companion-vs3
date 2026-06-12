// Founder Ecosystem — Phase 10 recommendation dashboard view-model.
// Render-ready shape for an internal panel or a GHL embed: headline, today's
// cards (with their action buttons), time plan, advisor notes and alerts.
// Pure — no rendering.

import type { FounderEvent, ID } from "../events";
import {
  getFounderRecommendations,
} from "./founderRecommendationEngine";
import type { RecommendationContext } from "./recommendationTypes";
import type {
  ActionLink,
  AdvisorNote,
  FounderRecommendations,
} from "./recommendationTypes";

export type RecommendationCard = {
  id: ID;
  title: string;
  rationale: string;
  category: string;
  estimatedMinutes: number;
  buttons: { label: string; target: string; ref?: string; locked?: "google" | "ghl" }[];
  assistedPrompt?: string;
  avoid?: string;
  badge: string; // small source/priority badge
};

export type RecommendationDashboard = {
  founderId: ID;
  stage: string;
  headline: string;
  energy: string;
  availableMinutes: number;
  cards: RecommendationCard[];
  timePlan: { label: string; minutes: number }[];
  advisorNotes: AdvisorNote[];
  riskAlerts: string[];
  opportunityAlerts: string[];
  emptyState: string | null; // shown when there are no projects yet
};

const button = (l: ActionLink) => ({
  label: l.label,
  target: l.target,
  ref: l.ref,
  locked: l.requiresConnection,
});

export function buildRecommendationDashboard(
  r: FounderRecommendations,
): RecommendationDashboard {
  const cards: RecommendationCard[] = r.recommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    rationale: rec.rationale,
    category: rec.category,
    estimatedMinutes: rec.estimatedMinutes,
    buttons: rec.links.map(button),
    assistedPrompt: rec.assisted?.prompt,
    avoid: rec.avoid,
    badge: rec.source,
  }));

  return {
    founderId: r.founderId,
    stage: r.stage,
    headline: r.headline,
    energy: r.energy,
    availableMinutes: r.availableMinutes,
    cards,
    timePlan: r.timeAllocation.map((t) => ({ label: t.label, minutes: t.minutes })),
    advisorNotes: r.advisorNotes,
    riskAlerts: r.alerts.filter((a) => a.kind === "risk").map((a) => a.label),
    opportunityAlerts: r.alerts.filter((a) => a.kind === "opportunity").map((a) => a.label),
    emptyState: r.hasProjects
      ? null
      : "No active projects yet — start with the first step above and Shari will build from there.",
  };
}

/** Convenience: compute recommendations + build the dashboard in one call. */
export function getRecommendationDashboard(
  events: FounderEvent[],
  founderId: ID,
  ctx: RecommendationContext = {},
): RecommendationDashboard {
  return buildRecommendationDashboard(getFounderRecommendations(events, founderId, ctx));
}
