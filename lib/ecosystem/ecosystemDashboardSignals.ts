import type { GhlContentOpportunity, GhlProductSignal } from "@/lib/ghl/types";

import { generateLiveContentOpportunities } from "./liveContentOpportunityGenerator";
import type { EcosystemSignalCount } from "./serverSignalStore";

const STRUGGLE_LABELS: Record<string, string> = {
  overwhelm: "Overwhelm",
  prioritization: "Prioritization",
  focus: "Focus",
  follow_through: "Follow Through",
  decision_making: "Decision Making",
  marketing: "Marketing",
  content_creation: "Content Creation",
};

const QUESTION_LABELS: Record<string, string> = {
  what_should_i_work_on: "What should I work on?",
  help_me_prioritize: "Help me prioritize",
  im_overwhelmed: "I'm overwhelmed",
  dont_know_where_to_start: "Don't know where to start",
};

const EMOTION_LABELS: Record<string, string> = {
  frustrated: "Frustrated",
  stuck: "Stuck",
  confused: "Confused",
  excited: "Excited",
  hopeful: "Hopeful",
};

function labelFor(kind: string, category: string): string {
  if (kind === "struggle") return STRUGGLE_LABELS[category] ?? category;
  if (kind === "question") return QUESTION_LABELS[category] ?? category;
  if (kind === "emotion") return EMOTION_LABELS[category] ?? category;
  return category;
}

function productKindFor(kind: string): GhlProductSignal["kind"] {
  if (kind === "question") return "question";
  if (kind === "struggle") return "struggle";
  return "feedback";
}

export function ecosystemCountsToProductSignals(
  counts: EcosystemSignalCount[],
): GhlProductSignal[] {
  return counts
    .map((row) => ({
      label: labelFor(row.kind, row.category),
      count: row.count,
      kind: productKindFor(row.kind),
    }))
    .sort((a, b) => b.count - a.count);
}

export function ecosystemCountsToContentOpportunities(
  counts: EcosystemSignalCount[],
  productSignals?: GhlProductSignal[],
): GhlContentOpportunity[] {
  const live = generateLiveContentOpportunities({
    counts,
    productSignals,
  });

  return live.map((o) => ({
    topic: o.topic,
    topicKey: o.topicKey,
    mentions: o.frequency,
    opportunityScore: o.opportunityScore,
    trend: o.trend,
    whyThisMatters: o.whyThisMatters,
    suggestedAssets: o.suggestedAssets.map((a) => a.label),
    assetIdeas: o.suggestedAssets.map((a) => ({
      type: a.type,
      label: a.label,
      title: a.title,
      angle: a.angle,
    })),
    sourceSignals: o.sourceSignals,
  }));
}

export { toPostCraftLiveExport } from "./liveContentOpportunityGenerator";
