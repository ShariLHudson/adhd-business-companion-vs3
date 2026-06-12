// Founder Ecosystem — Phase 9 Journey dashboard view-model.
// One compact, render-ready object for the "where you are" dashboard panel:
// current stage, focus, challenges, opportunities and recommended actions.
// Pure — no rendering.

import type { FounderEvent, ID } from "../events";
import { detectFounderJourney, type JourneyOptions } from "./founderJourneyEngine";
import { advisorBoardForJourney } from "./advisorStageGuidance";
import {
  selectJourneyProgress,
  selectPrimaryFocusLabel,
  selectStageLabel,
} from "./journeySelectors";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  type AdvisorStageGuidance,
  type BusinessStage,
  type FounderFocus,
  type FounderJourney,
  type Level,
} from "./journeyTypes";

const FOCUS_LABEL: Record<FounderFocus, string> = {
  marketing: "Marketing",
  sales: "Sales",
  operations: "Operations",
  "product-creation": "Product creation",
  systems: "Systems",
  content: "Content",
  "customer-success": "Customer success",
  leadership: "Leadership",
};

export type JourneyStageStep = {
  stage: BusinessStage;
  label: string;
  state: "done" | "current" | "upcoming";
};

export type JourneyDashboard = {
  founderId: ID;
  stage: BusinessStage;
  stageLabel: string;
  previousStageLabel: string | null;
  confidence: Level;
  progress: number; // 0–1 across the 5 stages
  steps: JourneyStageStep[]; // progress bar / stepper
  primaryFocus: string | null;
  secondaryFocus: string | null;
  challenges: string[];
  opportunities: string[];
  risks: string[];
  recommendedActions: { text: string; reason: string; avoid?: string }[];
  advisorGuidance: AdvisorStageGuidance[];
};

export function buildJourneyDashboard(journey: FounderJourney): JourneyDashboard {
  const curIdx = STAGE_ORDER.indexOf(journey.currentStage);
  const steps: JourneyStageStep[] = STAGE_ORDER.map((stage, i) => ({
    stage,
    label: STAGE_LABEL[stage],
    state: i < curIdx ? "done" : i === curIdx ? "current" : "upcoming",
  }));

  return {
    founderId: journey.founderId,
    stage: journey.currentStage,
    stageLabel: selectStageLabel(journey),
    previousStageLabel: journey.previousStage ? STAGE_LABEL[journey.previousStage] : null,
    confidence: journey.confidence,
    progress: selectJourneyProgress(journey),
    steps,
    primaryFocus: selectPrimaryFocusLabel(journey),
    secondaryFocus: journey.secondaryFocus ? FOCUS_LABEL[journey.secondaryFocus] : null,
    challenges: journey.currentChallenges,
    opportunities: journey.currentOpportunities,
    risks: journey.currentRisks,
    recommendedActions: journey.recommendations.map((r) => ({
      text: r.text,
      reason: r.reason,
      avoid: r.avoid,
    })),
    advisorGuidance: advisorBoardForJourney(journey),
  };
}

/** Convenience: detect + build the dashboard in one call. */
export function getJourneyDashboard(
  events: FounderEvent[],
  founderId: ID,
  opts: JourneyOptions = {},
): JourneyDashboard {
  return buildJourneyDashboard(detectFounderJourney(events, founderId, opts));
}
