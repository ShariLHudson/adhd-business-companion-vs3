import type { ExecutiveBrief, ExecutiveBriefFilter, ExecutiveBriefItemCore } from "../types";
import { executiveBriefSampleRepository } from "../repositories/sample";
import { listFounderAlerts } from "../alerts/founderAlerts";
import { buildIfIWereRunningSection } from "../recommendations/advisorSection";
import { learningSectionsForItem } from "../presentation/learningLayers";
import { listExpandableEvidence } from "../explanations/evidenceHelpers";
import { comparePriority } from "../presentation/priorityPresentation";
import { readabilityScore } from "../explanations/readabilityHelpers";

export function buildExecutiveBrief(filter?: ExecutiveBriefFilter): ExecutiveBrief {
  const brief = filter?.date
    ? executiveBriefSampleRepository.getBrief(filter.date)
    : executiveBriefSampleRepository.composeFromOvernight();

  if (!filter?.missionId) return brief;

  const missionId = filter.missionId;
  return {
    ...brief,
    founderAlerts: brief.founderAlerts.filter((a) =>
      a.relatedMissionIds.includes(missionId),
    ),
    opportunities: brief.opportunities.filter((o) =>
      o.relatedMissionIds.includes(missionId),
    ),
    risks: brief.risks.filter((r) => r.relatedMissionIds.includes(missionId)),
    recommendations: brief.recommendations.filter((r) =>
      r.relatedMissionIds.includes(missionId),
    ),
    decisions: brief.decisions.filter((d) => d.relatedMissionIds.includes(missionId)),
  };
}

export function buildBriefWithEvidenceExpansion(brief: ExecutiveBrief): ExecutiveBrief {
  const enrich = <T extends ExecutiveBriefItemCore>(item: T): T => ({
    ...item,
    evidence: listExpandableEvidence(item.evidence),
    learning: item.learning ?? learningSectionsForItem(item),
  });

  return {
    ...brief,
    founderAlerts: brief.founderAlerts.map(enrich),
    opportunities: brief.opportunities.map(enrich),
    risks: brief.risks.map(enrich),
    recommendations: brief.recommendations.map(enrich),
  };
}

export function sortBriefItemsByPriority<T extends ExecutiveBriefItemCore>(items: T[]): T[] {
  return [...items].sort((a, b) => comparePriority(a.priority, b.priority));
}

export function briefReadabilityReport(brief: ExecutiveBrief): { average: number; passes: boolean } {
  const texts = [
    brief.summary.headline,
    ...brief.founderAlerts.map((a) => a.simpleExplanation),
    ...brief.opportunities.map((o) => o.simpleExplanation),
    brief.calmClose,
  ];
  const scores = texts.map(readabilityScore);
  const average = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  return { average, passes: average >= 70 };
}

export function rebuildAdvisorSection(brief: ExecutiveBrief): ExecutiveBrief {
  return {
    ...brief,
    ifIWereRunning: buildIfIWereRunningSection(),
  };
}

export function ensureFounderAlertsFirst(brief: ExecutiveBrief): ExecutiveBrief {
  return {
    ...brief,
    founderAlerts: listFounderAlerts().map((a) => ({
      ...a,
      appearsFirst: true as const,
    })),
  };
}
