/**
 * Business Basics — one-question flow over existing identity fields.
 * Storage: companion-business-profile-v1 estate.identity (no new store).
 */
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
} from "@/lib/profile/businessEstateProfile";
import { BUSINESS_STAGE_CHOICES } from "@/lib/profile/guidedFieldTypes";
import { fieldPathHasValue } from "@/lib/profile/guidedStageCompletion";
import { sectionStorageKey } from "@/lib/profile/businessEstateSectionFields";

export const BUSINESS_BASICS_STAGE_ID = "identity-basics" as const;

export const BUSINESS_BASICS_FIELD_PATHS = [
  "identity.businessName",
  "identity.shortDescription",
  "identity.businessStage",
] as const;

export type BusinessBasicsFieldKey =
  | "businessName"
  | "shortDescription"
  | "businessStage";

export type BusinessBasicsQuestion = {
  index: number;
  fieldKey: BusinessBasicsFieldKey;
  fieldPath: (typeof BUSINESS_BASICS_FIELD_PATHS)[number];
  prompt: string;
  help: string;
  kind: "text" | "textarea" | "choice";
};

/** Friendlier stage choices — persist using existing BUSINESS_STAGE_CHOICES labels. */
export const BUSINESS_BASICS_STAGE_OPTIONS: readonly {
  id: string;
  label: string;
  persistLabel: string;
}[] = [
  { id: "idea", label: "Still an idea", persistLabel: "Idea" },
  {
    id: "getting_started",
    label: "Getting started",
    persistLabel: "Preparing to Launch",
  },
  {
    id: "building_foundation",
    label: "Building the foundation",
    persistLabel: "Newly Launched",
  },
  {
    id: "serving",
    label: "Serving customers or clients",
    persistLabel: "Growing",
  },
  { id: "growing", label: "Growing", persistLabel: "Growing" },
  {
    id: "simplifying",
    label: "Simplifying",
    persistLabel: "Reinventing",
  },
  {
    id: "rebuilding",
    label: "Rebuilding",
    persistLabel: "Reinventing",
  },
  { id: "paused", label: "Paused for now", persistLabel: "Paused" },
  {
    id: "something_else",
    label: "Something else",
    persistLabel: "I'm Not Sure",
  },
];

export const BUSINESS_BASICS_QUESTIONS: readonly BusinessBasicsQuestion[] = [
  {
    index: 0,
    fieldKey: "businessName",
    fieldPath: "identity.businessName",
    prompt: "What is the name of your business?",
    help: "Use the name you already use with clients — or a working name if you are still deciding.",
    kind: "text",
  },
  {
    index: 1,
    fieldKey: "shortDescription",
    fieldPath: "identity.shortDescription",
    prompt: "How would you describe your business in a few simple sentences?",
    help: "A plain explanation is enough. You can refine this later.",
    kind: "textarea",
  },
  {
    index: 2,
    fieldKey: "businessStage",
    fieldPath: "identity.businessStage",
    prompt: "Where would you say your business is right now?",
    help: "Pick the closest fit. There is no wrong season.",
    kind: "choice",
  },
] as const;

export function readIdentityField(fieldKey: BusinessBasicsFieldKey): string {
  const envelope = getBusinessEstateEnvelope();
  const section = envelope.sections[
    sectionStorageKey("identity")
  ] as Record<string, string>;
  return (section?.[fieldKey] ?? "").trim();
}

export function businessBasicsProgress(): {
  answered: number;
  total: number;
  nextIndex: number;
  complete: boolean;
} {
  let answered = 0;
  let nextIndex = 0;
  let foundGap = false;
  for (let i = 0; i < BUSINESS_BASICS_QUESTIONS.length; i++) {
    const q = BUSINESS_BASICS_QUESTIONS[i]!;
    const filled = fieldPathHasValue(q.fieldPath);
    if (filled) answered += 1;
    else if (!foundGap) {
      nextIndex = i;
      foundGap = true;
    }
  }
  if (!foundGap) nextIndex = BUSINESS_BASICS_QUESTIONS.length;
  return {
    answered,
    total: BUSINESS_BASICS_QUESTIONS.length,
    nextIndex,
    complete: answered >= BUSINESS_BASICS_QUESTIONS.length,
  };
}

export function isBusinessBasicsComplete(): boolean {
  return businessBasicsProgress().complete;
}

export function saveBusinessBasicsAnswer(
  fieldKey: BusinessBasicsFieldKey,
  value: string,
): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  saveBusinessEstateSection("identity", { [fieldKey]: trimmed });
}

export function persistStageChoiceLabel(optionId: string): string {
  const opt = BUSINESS_BASICS_STAGE_OPTIONS.find((o) => o.id === optionId);
  if (opt) return opt.persistLabel;
  const legacy = BUSINESS_STAGE_CHOICES.find((c) => c.id === optionId);
  return legacy?.label ?? optionId;
}

export function matchStageOptionId(savedLabel: string): string | null {
  const t = savedLabel.trim().toLowerCase();
  if (!t) return null;
  for (const opt of BUSINESS_BASICS_STAGE_OPTIONS) {
    if (opt.label.toLowerCase() === t) return opt.id;
    if (opt.persistLabel.toLowerCase() === t) return opt.id;
  }
  for (const c of BUSINESS_STAGE_CHOICES) {
    if (c.label.toLowerCase() === t || c.id === t) {
      const mapped = BUSINESS_BASICS_STAGE_OPTIONS.find(
        (o) => o.persistLabel === c.label,
      );
      return mapped?.id ?? c.id;
    }
  }
  return null;
}

export const BUSINESS_BASICS_PAUSE_AFTER = 2;
