/**
 * Package 189 — Create guided conversation (blueprint-driven, not reflective).
 */

import { facilitationQuestionsForType } from "@/lib/facilitatedCreation/facilitationBlueprint";
import { getDiscoveryQuestions } from "@/lib/createWorkflow";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";

/** Destination only — AppBackButton formats as "Back to Focus". */
export const CREATE_BACK_TO_FOCUS_DESTINATION = "Focus" as const;

/** Full visible label when not using AppBackButton. */
export const CREATE_BACK_TO_FOCUS_LABEL = "Back to Focus" as const;

export const CREATE_GUIDED_SUPPORT_LINE =
  "Tell Shari what you want to create, and she will help you shape it one step at a time." as const;

export const CREATE_INTENT_COMPOSER_PLACEHOLDER =
  "What would you like to create?" as const;

/** Human progress labels — never percentages. */
export type CreateProgressPhaseId =
  | "getting-started"
  | "learning-what-you-need"
  | "shaping-the-content"
  | "building-your-draft"
  | "reviewing-together";

export const CREATE_PROGRESS_PHASE_LABEL: Record<CreateProgressPhaseId, string> =
  {
    "getting-started": "Getting Started",
    "learning-what-you-need": "Learning What You Need",
    "shaping-the-content": "Shaping the Content",
    "building-your-draft": "Building Your Draft",
    "reviewing-together": "Reviewing Together",
  };

const REFLECTIVE_BANNED =
  /\b(?:what feels unfinished|what matters most here|what else wants to be said|what possibilities have you considered|what do you need that you may not be getting|tell me more\.?$|how does that make you feel|what would help most right now)\b/i;

export function isBannedCreateReflectivePrompt(text: string): boolean {
  return REFLECTIVE_BANNED.test(text.trim());
}

function stripMd(text: string): string {
  return text.replace(/\*\*/g, "").replace(/__+/g, "").trim();
}

/** First blueprint question for a creation type — never a generic reflective prompt. */
export function firstBlueprintQuestionForType(typeLabel: string): string | null {
  const disc = getDiscoveryQuestions(typeLabel)[0];
  if (disc?.prompt?.trim()) return stripMd(disc.prompt);
  const fac = facilitationQuestionsForType(typeLabel)[0];
  if (fac?.prompt?.trim()) return stripMd(fac.prompt);
  return null;
}

/**
 * Warm, practical opener after a clear type is known.
 * Example: Client Onboarding → who will receive it.
 */
export function createGuidedOpenerForType(typeLabel: string): string {
  const display = userFacingCreateTypeLabel(typeLabel) ?? typeLabel;
  const first = firstBlueprintQuestionForType(typeLabel);
  if (first && !isBannedCreateReflectivePrompt(first)) {
    return `We can build that ${display} together. ${first}`;
  }
  return `We can build that ${display} together. Who is this meant for?`;
}

export function resolveCreateProgressPhase(input: {
  hasType: boolean;
  answeredCount: number;
  hasDraftContent: boolean;
  reviewing?: boolean;
}): CreateProgressPhaseId {
  if (input.reviewing) return "reviewing-together";
  if (input.hasDraftContent) return "building-your-draft";
  if (!input.hasType) return "getting-started";
  if (input.answeredCount <= 0) return "getting-started";
  if (input.answeredCount <= 2) return "learning-what-you-need";
  return "shaping-the-content";
}

/**
 * New creations must not open the empty section-card editor.
 * Resume with real section content may use the compatibility view.
 */
export function shouldShowLegacySectionEditor(input: {
  hasResolvedType: boolean;
  sectionContents?: readonly string[];
  draftText?: string;
}): boolean {
  if (!input.hasResolvedType) return false;
  const sections = input.sectionContents ?? [];
  const hasSectionBody = sections.some((c) => c.trim().length > 0);
  const hasDraft = Boolean(input.draftText?.trim());
  return hasSectionBody || hasDraft;
}
