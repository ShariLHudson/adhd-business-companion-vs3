import type { ResearchCenterBootstrap } from "@/lib/research/types";
import {
  composeResearchSession,
  getResearchCategories,
  getSignificantResearchAlerts,
  getSuggestedResearchQueries,
  listSampleReports,
} from "@/lib/research";

/** Bootstrap for Executive Research Center room UI. */
export function getResearchCenterBootstrap(): ResearchCenterBootstrap {
  const reports = listSampleReports();
  return {
    categories: getResearchCategories(),
    suggestedQueries: getSuggestedResearchQueries(),
    significantAlerts: getSignificantResearchAlerts(),
    recentSessions: reports.slice(0, 3).map((r) => ({
      id: r.id,
      query: r.query,
      categoryLabel: r.categoryLabel,
      generatedAt: r.generatedAt,
    })),
    sampleReportId: reports[0]?.id ?? "report-adhd-founders-month",
  };
}

export { composeResearchSession };
