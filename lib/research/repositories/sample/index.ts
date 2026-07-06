import {
  RESEARCH_CATEGORIES,
  RESEARCH_PRINCIPLE,
  SAMPLE_RESEARCH_REPORTS,
  SIGNIFICANT_RESEARCH_ALERTS,
  SUGGESTED_RESEARCH_QUERIES,
  getSampleReport,
} from "../../sample/researchData";
import type { ExecutiveResearchReport, ResearchCategoryId } from "../types";

const SO_WHAT_MINIMUM = 70;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchReport(query: string): ExecutiveResearchReport | undefined {
  const q = normalizeQuery(query);
  if (q.includes("adhd") && (q.includes("founder") || q.includes("struggling"))) {
    return getSampleReport("report-adhd-founders-month");
  }
  if (q.includes("ai") && (q.includes("tool") || q.includes("time") || q.includes("save"))) {
    return getSampleReport("report-ai-tools-time");
  }
  if (q.includes("reddit") || q.includes("adhd")) {
    return getSampleReport("report-adhd-founders-month");
  }
  if (q.includes("product") && q.includes("build")) {
    return getSampleReport("report-ai-tools-time");
  }
  if (q.includes("competitor") || q.includes("opportunit")) {
    return getSampleReport("report-ai-tools-time");
  }
  if (q.includes("learn")) {
    return getSampleReport("report-adhd-founders-month");
  }
  return SAMPLE_RESEARCH_REPORTS.find((r) => normalizeQuery(r.query) === q);
}

export const researchSampleRepository = {
  principle: () => RESEARCH_PRINCIPLE,
  categories: () => RESEARCH_CATEGORIES,
  suggestedQueries: () => SUGGESTED_RESEARCH_QUERIES,
  significantAlerts: () => SIGNIFICANT_RESEARCH_ALERTS.filter((a) => a.significant),
  reports: () => SAMPLE_RESEARCH_REPORTS,
  getReport: (id: string) => getSampleReport(id),
  matchReport,
  soWhatMinimum: () => SO_WHAT_MINIMUM,
  reportsForCategory: (categoryId: ResearchCategoryId) =>
    SAMPLE_RESEARCH_REPORTS.filter((r) => r.categoryId === categoryId),
};
