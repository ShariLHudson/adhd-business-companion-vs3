import type {
  FounderIntelligenceInboxStatus,
  FounderIntelligencePipelineStage,
  FounderIntelligenceRoomOverview,
} from "../types";
import { sampleIntelligenceRepository } from "../repositories";

/** Incoming signals — newest first. */
export function getIncomingSignals(limit = 5) {
  return sampleIntelligenceRepository.listSignals(limit);
}

/** Executive timeline — chronological events. */
export function getExecutiveTimeline(limit = 8) {
  return sampleIntelligenceRepository.listTimeline(limit);
}

/** Intelligence inbox — optional filter by status. */
export function getIntelligenceInbox(status?: FounderIntelligenceInboxStatus) {
  return sampleIntelligenceRepository.listInbox(status);
}

/** Recent findings across all kinds. */
export function getRecentFindings(limit = 5) {
  return sampleIntelligenceRepository.listFindings(limit);
}

/** Source registry summary with sample counts. */
export function getSourceSummary() {
  return sampleIntelligenceRepository.getSourceSummary();
}

/** Pipeline stage counts — plumbing status only. */
export function getPipelineStatus(): FounderIntelligencePipelineStage[] {
  return sampleIntelligenceRepository.getPipelineStages();
}

/** Full overview for Executive Intelligence room. */
export function getIntelligenceRoomOverview(): FounderIntelligenceRoomOverview {
  return sampleIntelligenceRepository.getRoomOverview();
}

/**
 * Sample pipeline trace — demonstrates flow without AI.
 * Source → Signal → Finding → … → Archive
 */
export function traceSamplePipeline(signalId: string) {
  const signal = sampleIntelligenceRepository
    .listSignals(20)
    .find((item) => item.id === signalId);
  if (!signal) return null;

  const finding = sampleIntelligenceRepository
    .listFindings(20)
    .find((item) => item.signalId === signalId);
  const insight = finding
    ? sampleIntelligenceRepository
        .listInsightCandidates()
        .find((item) => item.findingId === finding.id)
    : undefined;
  const recommendation = insight
    ? sampleIntelligenceRepository
        .listRecommendationCandidates()
        .find((item) => item.insightCandidateId === insight.id)
    : undefined;
  const report = recommendation
    ? sampleIntelligenceRepository
        .listReportCandidates()
        .find((item) => item.recommendationCandidateId === recommendation.id)
    : undefined;

  return {
    sourceId: signal.sourceId,
    signal,
    finding: finding ?? null,
    insightCandidate: insight ?? null,
    recommendationCandidate: recommendation ?? null,
    reportCandidate: report ?? null,
    archive: null,
  };
}
