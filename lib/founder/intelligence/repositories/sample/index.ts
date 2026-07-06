import type {
  FounderContentCandidate,
  FounderDecisionCandidate,
  FounderInsightCandidate,
  FounderIntelligenceArchiveRecord,
  FounderIntelligenceFinding,
  FounderIntelligenceInboxItem,
  FounderIntelligenceInboxStatus,
  FounderIntelligencePipelineStage,
  FounderIntelligenceRoomOverview,
  FounderIntelligenceSignal,
  FounderIntelligenceSourceSummary,
  FounderIntelligenceTimelineEvent,
  FounderOpportunityCandidate,
  FounderRecommendationCandidate,
  FounderReportCandidate,
} from "../../types";
import { INTELLIGENCE_PIPELINE_STAGES } from "../../pipeline";
import { FOUNDER_INTELLIGENCE_SOURCE_REGISTRY } from "../../sources/registry";
import {
  SAMPLE_CONTENT_CANDIDATES,
  SAMPLE_DECISION_CANDIDATES,
  SAMPLE_INSIGHT_CANDIDATES,
  SAMPLE_INBOX_ITEMS,
  SAMPLE_INTELLIGENCE_ARCHIVES,
  SAMPLE_INTELLIGENCE_FINDINGS,
  SAMPLE_INTELLIGENCE_SIGNALS,
  SAMPLE_OPPORTUNITY_CANDIDATES,
  SAMPLE_RECOMMENDATION_CANDIDATES,
  SAMPLE_REPORT_CANDIDATES,
  SAMPLE_TIMELINE_EVENTS,
} from "./data";

export interface FounderIntelligenceRepository {
  listSignals(limit?: number): FounderIntelligenceSignal[];
  listTimeline(limit?: number): FounderIntelligenceTimelineEvent[];
  listInbox(status?: FounderIntelligenceInboxStatus): FounderIntelligenceInboxItem[];
  listFindings(limit?: number): FounderIntelligenceFinding[];
  listInsightCandidates(): FounderInsightCandidate[];
  listRecommendationCandidates(): FounderRecommendationCandidate[];
  listReportCandidates(): FounderReportCandidate[];
  listArchives(): FounderIntelligenceArchiveRecord[];
  getPipelineStages(): FounderIntelligencePipelineStage[];
  getSourceSummary(): FounderIntelligenceSourceSummary[];
  getRoomOverview(): FounderIntelligenceRoomOverview;
}

function sortNewest<T extends { occurredAt?: string; observedAt?: string; receivedAt?: string; discoveredAt?: string }>(
  items: readonly T[],
  dateKey: keyof T,
): T[] {
  return [...items].sort((a, b) => {
    const aDate = String(a[dateKey]);
    const bDate = String(b[dateKey]);
    return bDate.localeCompare(aDate);
  });
}

function buildSourceSummary(): FounderIntelligenceSourceSummary[] {
  return FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.map((source) => ({
    sourceId: source.id,
    name: source.name,
    category: source.category,
    status: source.status,
    signalCount: SAMPLE_INTELLIGENCE_SIGNALS.filter((s) => s.sourceId === source.id)
      .length,
    findingCount: SAMPLE_INTELLIGENCE_FINDINGS.filter((f) => f.sourceId === source.id)
      .length,
  })).filter((s) => s.signalCount > 0 || s.findingCount > 0 || s.status !== "placeholder")
    .slice(0, 12);
}

function buildPipelineStages(): FounderIntelligencePipelineStage[] {
  const counts: Record<string, number> = {
    source: FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.length,
    signal: SAMPLE_INTELLIGENCE_SIGNALS.length,
    finding: SAMPLE_INTELLIGENCE_FINDINGS.length,
    "insight-candidate": SAMPLE_INSIGHT_CANDIDATES.length,
    "recommendation-candidate": SAMPLE_RECOMMENDATION_CANDIDATES.length,
    "report-candidate": SAMPLE_REPORT_CANDIDATES.length,
    archive: SAMPLE_INTELLIGENCE_ARCHIVES.length,
  };

  return INTELLIGENCE_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: counts[stage.id] ?? 0,
  }));
}

function groupInbox(): Record<
  FounderIntelligenceInboxStatus,
  FounderIntelligenceInboxItem[]
> {
  const groups: Record<FounderIntelligenceInboxStatus, FounderIntelligenceInboxItem[]> = {
    new: [],
    "needs-review": [],
    accepted: [],
    archived: [],
  };

  for (const item of SAMPLE_INBOX_ITEMS) {
    groups[item.status].push(item);
  }

  return groups;
}

export const sampleIntelligenceRepository: FounderIntelligenceRepository = {
  listSignals(limit = 5) {
    return sortNewest(SAMPLE_INTELLIGENCE_SIGNALS, "observedAt").slice(0, limit);
  },

  listTimeline(limit = 8) {
    return sortNewest(SAMPLE_TIMELINE_EVENTS, "occurredAt").slice(0, limit);
  },

  listInbox(status) {
    if (status) {
      return SAMPLE_INBOX_ITEMS.filter((item) => item.status === status);
    }
    return [...SAMPLE_INBOX_ITEMS];
  },

  listFindings(limit = 5) {
    return sortNewest(SAMPLE_INTELLIGENCE_FINDINGS, "discoveredAt").slice(0, limit);
  },

  listInsightCandidates() {
    return [...SAMPLE_INSIGHT_CANDIDATES];
  },

  listRecommendationCandidates() {
    return [...SAMPLE_RECOMMENDATION_CANDIDATES];
  },

  listReportCandidates() {
    return [...SAMPLE_REPORT_CANDIDATES];
  },

  listArchives() {
    return [...SAMPLE_INTELLIGENCE_ARCHIVES];
  },

  getPipelineStages() {
    return buildPipelineStages();
  },

  getSourceSummary() {
    return buildSourceSummary();
  },

  getRoomOverview() {
    return {
      incomingSignals: this.listSignals(5),
      timeline: this.listTimeline(8),
      inbox: groupInbox(),
      recentFindings: this.listFindings(5),
      sourceSummary: this.getSourceSummary(),
      pipelineStatus: this.getPipelineStages(),
    };
  },
};

// Re-export candidate collections for pipeline service
export {
  SAMPLE_CONTENT_CANDIDATES,
  SAMPLE_DECISION_CANDIDATES,
  SAMPLE_OPPORTUNITY_CANDIDATES,
};
