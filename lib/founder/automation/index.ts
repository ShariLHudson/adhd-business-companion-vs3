import type { FounderAutomationOpportunity } from "../types";
import { sampleAutomationRepository } from "../repositories";

export function getAutomationIdeas(): FounderAutomationOpportunity[] {
  return sampleAutomationRepository.listIdeas();
}

export function getAutomationCandidates(): FounderAutomationOpportunity[] {
  return sampleAutomationRepository.listCandidates();
}

export function getAutomationQuickWins(): FounderAutomationOpportunity[] {
  return sampleAutomationRepository.listQuickWins();
}

/** Spec alias — automation quick wins. */
export const getQuickWins = getAutomationQuickWins;
