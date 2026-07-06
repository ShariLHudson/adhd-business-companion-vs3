import type { FounderReport } from "../types";
import { sampleKnowledgeRepository } from "../repositories";

export function getReports(): FounderReport[] {
  return sampleKnowledgeRepository.listReports();
}

export function getReport(id: string): FounderReport | null {
  return sampleKnowledgeRepository.getReport(id);
}

export function searchReports(query: string): FounderReport[] {
  return sampleKnowledgeRepository.searchReports(query);
}
