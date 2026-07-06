import { applyRuleOfThree } from "@/lib/calmIntelligence";

import { researchSampleRepository } from "../repositories/sample";
import type {
  ExecutiveResearchReport,
  ResearchAlert,
  ResearchCategory,
  ResearchCategoryId,
  ResearchSessionView,
  ResearchSuggestedQuery,
} from "../types";

export function getResearchCategories(): ResearchCategory[] {
  return researchSampleRepository.categories();
}

export function getSuggestedResearchQueries(): ResearchSuggestedQuery[] {
  return researchSampleRepository.suggestedQueries();
}

export function getSignificantResearchAlerts(): ResearchAlert[] {
  return applyRuleOfThree(researchSampleRepository.significantAlerts()).items;
}

function attachQuery(report: ExecutiveResearchReport, query: string): ExecutiveResearchReport {
  return { ...report, query, generatedAt: new Date().toISOString() };
}

/** Compose a full executive research session — answer through prepared implementation. */
export function composeResearchSession(query: string): ResearchSessionView | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const matched = researchSampleRepository.matchReport(trimmed);
  const report = matched ?? researchSampleRepository.reports()[0];
  if (!report) return null;

  if (!report.passesSoWhatRule || report.soWhatScore < researchSampleRepository.soWhatMinimum()) {
    return null;
  }

  return {
    product: "founder",
    query: trimmed,
    report: attachQuery(report, trimmed),
    generatedAt: new Date().toISOString(),
  };
}

export function composeResearchSessionById(reportId: string, query?: string): ResearchSessionView | null {
  const report = researchSampleRepository.getReport(reportId);
  if (!report || !report.passesSoWhatRule) return null;
  return {
    product: "founder",
    query: query ?? report.query,
    report: attachQuery(report, query ?? report.query),
    generatedAt: new Date().toISOString(),
  };
}

export function searchResearchQueries(phrase: string): ResearchSuggestedQuery[] {
  const q = phrase.trim().toLowerCase();
  if (!q) return getSuggestedResearchQueries();
  return getSuggestedResearchQueries().filter(
    (item) => item.phrase.toLowerCase().includes(q) || item.id.includes(q),
  );
}

export function researchForCategory(categoryId: ResearchCategoryId): ExecutiveResearchReport[] {
  return researchSampleRepository.reportsForCategory(categoryId);
}

export class ResearchService {
  composeSession(query: string) {
    return composeResearchSession(query);
  }

  composeById(reportId: string, query?: string) {
    return composeResearchSessionById(reportId, query);
  }

  alerts() {
    return getSignificantResearchAlerts();
  }

  categories() {
    return getResearchCategories();
  }

  sampleRepository() {
    return researchSampleRepository;
  }
}

export const researchService = new ResearchService();
