import type {
  ExecutiveBrief,
  ExecutiveBriefFilter,
  ExecutiveBriefItemCore,
  ExecutiveLearning,
} from "../types";
import {
  briefReadabilityReport,
  buildBriefWithEvidenceExpansion,
  buildExecutiveBrief,
  ensureFounderAlertsFirst,
  sortBriefItemsByPriority,
} from "../builders/briefBuilder";
import { listFounderAlerts } from "../alerts/founderAlerts";
import { buildIfIWereRunningSection, topAdvisorRecommendations } from "../recommendations/advisorSection";
import { learningSectionsForItem } from "../presentation/learningLayers";
import { listExpandableEvidence } from "../explanations/evidenceHelpers";
import { labelForPriority } from "../presentation/priorityPresentation";
import { labelForTimeSensitivity } from "../presentation/timeSensitivity";

export class ExecutiveBriefService {
  getBrief(filter?: ExecutiveBriefFilter): ExecutiveBrief {
    const brief = ensureFounderAlertsFirst(buildExecutiveBrief(filter));
    return buildBriefWithEvidenceExpansion(brief);
  }

  listFounderAlerts() {
    return listFounderAlerts();
  }

  getAdvisorSection() {
    return buildIfIWereRunningSection();
  }

  topAdvisorRecommendations(limit = 3) {
    return topAdvisorRecommendations(limit);
  }

  learningForItem(item: ExecutiveBriefItemCore): ExecutiveLearning {
    return learningSectionsForItem(item);
  }

  evidenceForItem(item: ExecutiveBriefItemCore) {
    return listExpandableEvidence(item.evidence);
  }

  sortByPriority<T extends ExecutiveBriefItemCore>(items: T[]) {
    return sortBriefItemsByPriority(items);
  }

  readabilityReport(brief?: ExecutiveBrief) {
    return briefReadabilityReport(brief ?? this.getBrief());
  }

  formatPriority(item: ExecutiveBriefItemCore) {
    return labelForPriority(item.priority.label);
  }

  formatTimeSensitivity(item: ExecutiveBriefItemCore) {
    return labelForTimeSensitivity(item.timeSensitivity);
  }
}

export const executiveBriefService = new ExecutiveBriefService();

export function getExecutiveBrief(filter?: ExecutiveBriefFilter): ExecutiveBrief {
  return executiveBriefService.getBrief(filter);
}

export function getFounderAlerts() {
  return executiveBriefService.listFounderAlerts();
}

export function getIfIWereRunningSection() {
  return executiveBriefService.getAdvisorSection();
}
