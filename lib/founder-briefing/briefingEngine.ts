/**
 * Founder Morning Briefing 2.0 — entire ecosystem in under 60 seconds.
 */

import {
  buildOpportunityCandidates,
  buildPriorityCandidates,
  buildRecommendationCandidates,
  buildRiskCandidates,
  buildWinCandidates,
  gatherIntelligenceReports,
} from "./briefingInsights";
import { buildGreeting, buildSummaryLines } from "./briefingMessages";
import {
  inferOverallStatus,
  pickTopItems,
} from "./briefingPriorities";
import { markBriefingViewed } from "./briefingStore";
import type { FounderBriefing } from "./types";

export function buildFounderMorningBriefing(now = new Date()): FounderBriefing {
  const agg = gatherIntelligenceReports(now);
  const overallStatus = inferOverallStatus(agg);

  const briefing: FounderBriefing = {
    date: now.toISOString().slice(0, 10),
    overallStatus,
    topPriorities: pickTopItems(buildPriorityCandidates(agg), 3),
    opportunities: pickTopItems(buildOpportunityCandidates(agg), 4),
    risks: pickTopItems(buildRiskCandidates(agg), 4),
    wins: pickTopItems(buildWinCandidates(agg), 4),
    recommendations: buildRecommendationCandidates(agg).slice(0, 3),
    greeting: buildGreeting(now),
    summaryLines: buildSummaryLines(overallStatus, agg),
    createdAt: now.toISOString(),
  };

  return briefing;
}

export function buildAndRecordFounderMorningBriefing(
  now = new Date(),
): FounderBriefing {
  const briefing = buildFounderMorningBriefing(now);
  markBriefingViewed(briefing);
  return briefing;
}

export type { FounderBriefing };
