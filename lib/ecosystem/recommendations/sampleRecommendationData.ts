// Founder Ecosystem — Phase 10 sample recommendation data.
// Reuses the Phase 9 per-stage journey samples and runs them through the
// recommendation engine, plus a no-projects fallback case. Deterministic. Pure.

import type { FounderRecommendations, RecommendationContext } from "./recommendationTypes";
import { getFounderRecommendations } from "./founderRecommendationEngine";
import { sampleJourneySamples } from "../journey/sampleJourneyData";
import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";

const NOW = new Date("2026-06-10T09:00:00.000Z");

export type RecommendationSample = {
  label: string;
  recommendations: FounderRecommendations;
};

export function sampleRecommendationSets(): RecommendationSample[] {
  const out: RecommendationSample[] = [];

  // One per business stage (no project history → exercises the fallback path
  // for most, since these journey samples carry few project events).
  for (const s of sampleJourneySamples()) {
    const ctx: RecommendationContext = { now: NOW, profile: s.profile, energy: "medium" };
    out.push({
      label: `${s.stage} stage`,
      recommendations: getFounderRecommendations(s.events, s.founderId, ctx),
    });
  }

  // A founder WITH active projects (master workflow), at low energy + tight time.
  out.push({
    label: "active founder · low energy · 30 min",
    recommendations: getFounderRecommendations(
      simulateMasterWorkflow("founder-001", new Date("2026-06-01T09:00:00.000Z")),
      "founder-001",
      { now: new Date("2026-06-02T09:00:00.000Z"), energy: "low", availableMinutes: 30, googleConnected: true },
    ),
  });

  // A connected-GHL marketing founder.
  const launching = sampleJourneySamples().find((s) => s.stage === "launching")!;
  out.push({
    label: "launching · GHL connected",
    recommendations: getFounderRecommendations(launching.events, launching.founderId, {
      now: NOW,
      profile: launching.profile,
      ghlConnected: true,
      googleConnected: true,
    }),
  });

  return out;
}
