/**
 * Estate Knowledge Base — vocabulary and recommendation gate.
 */

import { getEstateVocabulary, getKnowledgeItem } from "./loader";
import type {
  EstateKnowledgeItem,
  EstateKnowledgeRegistryId,
  EstateKnowledgeStatus,
} from "./types";

export function isLiveKnowledgeItem(
  item: EstateKnowledgeItem | null | undefined,
): boolean {
  return item?.status === "Live";
}

/** Only Live items may be recommended to members. */
export function canRecommendKnowledgeItem(
  item: EstateKnowledgeItem | null | undefined,
): boolean {
  return isLiveKnowledgeItem(item);
}

export function officialNameFor(
  registryId: EstateKnowledgeRegistryId,
  id: string,
): string | null {
  const vocabulary = getEstateVocabulary();
  const table = vocabulary.officialNames[registryId as keyof typeof vocabulary.officialNames];
  if (table && id in table) {
    return table[id as keyof typeof table];
  }
  return getKnowledgeItem(registryId, id)?.officialName ?? null;
}

export function officialButtonLabel(buttonId: string): string | null {
  return getEstateVocabulary().officialNames.buttons[buttonId] ?? null;
}

export function isForbiddenSubstitution(
  officialName: string,
  candidateLabel: string,
): boolean {
  const vocabulary = getEstateVocabulary();
  const rule = vocabulary.forbiddenSubstitutions.find(
    (entry) => entry.insteadOf === officialName,
  );
  if (!rule) return false;
  const lower = candidateLabel.trim().toLowerCase();
  return rule.doNotUse.some((term) => term.toLowerCase() === lower);
}

export function assertRecommendable(
  item: EstateKnowledgeItem | null,
  context: string,
): item is EstateKnowledgeItem {
  if (!item) return false;
  if (!canRecommendKnowledgeItem(item)) return false;
  return true;
}

export function filterByStatus(
  items: EstateKnowledgeItem[],
  status: EstateKnowledgeStatus,
): EstateKnowledgeItem[] {
  return items.filter((item) => item.status === status);
}
