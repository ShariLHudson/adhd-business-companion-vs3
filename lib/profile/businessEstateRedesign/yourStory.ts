/**
 * Your Story — one-question guided flow over existing identity fields.
 * Presented inside Identity Office; renamed from "Business Story".
 * Storage: companion-business-profile-v1 estate.identity (no new store,
 * no new fields — organizes existing identity story fields only).
 */
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import { fieldPathHasValue } from "@/lib/profile/guidedStageCompletion";
import { sectionStorageKey } from "@/lib/profile/businessEstateSectionFields";

export type YourStoryFieldKey =
  | "businessStory"
  | "whatInspiredYou"
  | "whatHelpsYouContinue";

export type YourStoryQuestion = {
  index: number;
  fieldKey: YourStoryFieldKey;
  fieldPath: `identity.${YourStoryFieldKey}`;
  prompt: string;
  help: string;
};

export const YOUR_STORY_QUESTIONS: readonly YourStoryQuestion[] = [
  {
    index: 0,
    fieldKey: "businessStory",
    fieldPath: "identity.businessStory",
    prompt: "How did your business come to be?",
    help: "A few honest sentences are plenty — how it started, or the moment it felt real.",
  },
  {
    index: 1,
    fieldKey: "whatInspiredYou",
    fieldPath: "identity.whatInspiredYou",
    prompt: "What inspired you to begin?",
    help: "The person, need, or feeling behind it. There is no wrong answer.",
  },
  {
    index: 2,
    fieldKey: "whatHelpsYouContinue",
    fieldPath: "identity.whatHelpsYouContinue",
    prompt: "What helps you keep going when things get hard?",
    help: "What steadies you on the difficult days — Shari can lean on this when you return.",
  },
] as const;

export function readYourStoryField(fieldKey: YourStoryFieldKey): string {
  const envelope = getBusinessEstateEnvelope();
  const section = envelope.sections[
    sectionStorageKey("identity")
  ] as Record<string, string>;
  return (section?.[fieldKey] ?? "").trim();
}

export function yourStoryProgress(): {
  answered: number;
  total: number;
  nextIndex: number;
  complete: boolean;
} {
  let answered = 0;
  let nextIndex = 0;
  let foundGap = false;
  for (let i = 0; i < YOUR_STORY_QUESTIONS.length; i++) {
    const q = YOUR_STORY_QUESTIONS[i]!;
    const filled = fieldPathHasValue(q.fieldPath);
    if (filled) answered += 1;
    else if (!foundGap) {
      nextIndex = i;
      foundGap = true;
    }
  }
  if (!foundGap) nextIndex = YOUR_STORY_QUESTIONS.length;
  return {
    answered,
    total: YOUR_STORY_QUESTIONS.length,
    nextIndex,
    complete: answered >= YOUR_STORY_QUESTIONS.length,
  };
}

export function isYourStoryComplete(): boolean {
  return yourStoryProgress().complete;
}

export function saveYourStoryAnswer(
  fieldKey: YourStoryFieldKey,
  value: string,
): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  saveBusinessEstateSection("identity", { [fieldKey]: trimmed });
}
