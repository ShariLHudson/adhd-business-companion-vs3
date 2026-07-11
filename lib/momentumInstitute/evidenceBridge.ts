/**
 * Evidence Vault bridge — evidence is NEVER automatic.
 * Requires real-world outcome + member permission.
 */

import type { EvidenceOpportunity } from "./types";
import { createEvidenceEntry, type EvidenceEntry } from "@/lib/evidenceBankStore";
import { recordEvidenceSavedInProfile } from "./growthProfileStore";
import { getKnowledgeCardById } from "./catalog/provider";
import { DEFAULT_RETURN_CLOSING_KEY } from "@/lib/sparkMomentumInstitute/types";

const STORAGE_KEY = "companion-institute-evidence-opportunities-v1";

export const INSTITUTE_EVIDENCE_UPDATED_EVENT =
  "companion-institute-evidence-updated";

function newId(): string {
  return `evo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): EvidenceOpportunity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EvidenceOpportunity[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: EvidenceOpportunity[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(INSTITUTE_EVIDENCE_UPDATED_EVENT));
}

export function createEvidenceOpportunity(input: {
  learningExperienceId: string;
  knowledgeCardId: string;
  experienceDefinitionId: string;
}): EvidenceOpportunity {
  const now = new Date().toISOString();
  const opportunity: EvidenceOpportunity = {
    kind: "institute-evidence-opportunity",
    id: newId(),
    createdAt: now,
    updatedAt: now,
    learningExperienceId: input.learningExperienceId,
    knowledgeCardId: input.knowledgeCardId,
    experienceDefinitionId: input.experienceDefinitionId,
    status: "pending_return",
    originatedFromId: input.learningExperienceId,
    originatedFromKind: "institute-learning-experience",
  };

  writeAll([opportunity, ...readAll()]);
  return opportunity;
}

export function returnClosingPrompt(
  knowledgeCardTitle?: string,
  promptKey: string = DEFAULT_RETURN_CLOSING_KEY,
): string {
  if (promptKey !== DEFAULT_RETURN_CLOSING_KEY) {
    return `When you have a chance to use ${knowledgeCardTitle ?? "this"} in your business, come back and tell me what happened.`;
  }
  return (
    "When you have a chance to use this in your business, come back and tell me what happened. " +
    "I'd genuinely love to hear your story. " +
    "If it creates a breakthrough, we'll celebrate it together and preserve it in your Evidence Vault " +
    "so you'll always remember what you're capable of."
  );
}

export function evidencePermissionPrompt(knowledgeCardTitle: string): string {
  return (
    `That's a real breakthrough with **${knowledgeCardTitle}**. ` +
    "Would you like me to save this story in your Evidence Vault so you'll always remember what you're capable of?"
  );
}

export type SaveInstituteEvidenceInput = {
  opportunityId: string;
  whatHappened: string;
  whatImproved: string;
  whatMovedForward: string;
  whatProblemSolved?: string;
  whoBenefited?: string;
  whyItMattered?: string;
  whatThisProves?: string;
};

export function saveEvidenceFromOpportunity(
  input: SaveInstituteEvidenceInput,
): { opportunity: EvidenceOpportunity; evidence: EvidenceEntry } | null {
  const items = readAll();
  const idx = items.findIndex((o) => o.id === input.opportunityId);
  if (idx < 0) return null;

  const opportunity = items[idx]!;
  const card = getKnowledgeCardById(opportunity.knowledgeCardId);

  const evidence = createEvidenceEntry({
    category: "Business Growth",
    whatHappened: input.whatHappened,
    whatImproved: input.whatImproved,
    whatMovedForward: input.whatMovedForward,
    whatProblemSolved: input.whatProblemSolved ?? "",
    whoBenefited: input.whoBenefited ?? "",
    whyItMattered: input.whyItMattered ?? "",
    whatThisProves:
      input.whatThisProves ??
      `Applied ${card?.title ?? "Institute learning"} in my business.`,
    originatedFromId: opportunity.learningExperienceId,
    originatedFromKind: "institute-learning-experience",
    attachments: [],
  });

  const updated: EvidenceOpportunity = {
    ...opportunity,
    evidenceEntryId: evidence.id,
    status: "saved",
    updatedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  writeAll(items);

  recordEvidenceSavedInProfile({
    knowledgeCardId: opportunity.knowledgeCardId,
    learningExperienceId: opportunity.learningExperienceId,
    label: card?.title ?? "Evidence saved",
  });

  return { opportunity: updated, evidence };
}

export function markEvidenceStoryShared(opportunityId: string): void {
  const items = readAll();
  const idx = items.findIndex((o) => o.id === opportunityId);
  if (idx < 0) return;
  items[idx] = {
    ...items[idx]!,
    status: "story_shared",
    updatedAt: new Date().toISOString(),
  };
  writeAll(items);
}

export function clearEvidenceOpportunitiesForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
