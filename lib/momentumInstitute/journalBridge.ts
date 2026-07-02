/**
 * Journal bridge — references only, no duplicated lesson content.
 */

import {
  createJournalEntry,
  type JournalEntry,
} from "@/lib/growthJournalStore";
import { linkJournalToCabinetItem } from "./cabinetStore";
import { getKnowledgeCardById } from "./catalog/provider";

export type InstituteJournalLinkInput = {
  knowledgeCardId: string;
  learningExperienceId?: string;
  experienceDefinitionId?: string;
  cabinetItemId?: string;
  body: string;
  title?: string;
};

export function journalCapturePrompt(): string {
  return "Would you like to capture your thoughts while they're still fresh?";
}

export function createInstituteJournalEntry(
  input: InstituteJournalLinkInput,
): JournalEntry {
  const card = getKnowledgeCardById(input.knowledgeCardId);
  const title =
    input.title ??
    (card ? `Reflection: ${card.title}` : "Institute reflection");

  const { entry } = createJournalEntry({
    type: "lesson",
    title,
    body: input.body,
    tags: [
      "momentum-institute",
      input.knowledgeCardId,
      ...(input.experienceDefinitionId
        ? [input.experienceDefinitionId]
        : []),
    ],
    sourcePage: "momentum-institute",
    originatedFromId:
      input.learningExperienceId ?? input.knowledgeCardId,
    originatedFromKind: input.learningExperienceId
      ? "institute-learning-experience"
      : "knowledge-card",
  });

  if (input.cabinetItemId) {
    linkJournalToCabinetItem(input.cabinetItemId, entry.id);
  }

  return entry;
}
