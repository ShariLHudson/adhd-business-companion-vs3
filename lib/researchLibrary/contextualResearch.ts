import { captureResearchThisContext } from "@/lib/universalRequestOutcome";
import { setPendingContextualResearch } from "./persistence";
import type { ContextualResearchRequest } from "./types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build a ContextualResearchRequest so the user does not re-explain “this”.
 */
export function buildContextualResearchRequest(input: {
  sourceExperience: string;
  sourceEntityId?: string | null;
  sourceSelectionIds?: string[];
  selectedText?: string;
  selectedObjectSummaries?: string[];
  surroundingContext?: string | null;
  researchTopic?: string;
  researchQuestion?: string;
  purpose?: string;
  likelyIntendedOutcome?: string | null;
  currentInformationRequired?: boolean;
  returnContext?: string | null;
}): ContextualResearchRequest {
  const selectedText = (input.selectedText ?? "").trim();
  const topic =
    (input.researchTopic ?? "").trim() ||
    selectedText.slice(0, 120) ||
    "Selected topic";
  const captured = captureResearchThisContext({
    selectedTopic: topic,
    surroundingContext: input.surroundingContext,
    sourceExperience: input.sourceExperience,
    sourceEntityId: input.sourceEntityId,
    sourceSelectionIds: input.sourceSelectionIds,
    rawRequest: input.likelyIntendedOutcome,
  });

  return {
    id: newId("crr"),
    sourceExperience: input.sourceExperience,
    sourceEntityId: input.sourceEntityId ?? null,
    sourceSelectionIds: input.sourceSelectionIds ?? [],
    selectedText,
    selectedObjectSummaries: input.selectedObjectSummaries ?? [],
    surroundingContext: input.surroundingContext ?? null,
    researchTopic: captured.topic,
    researchQuestion:
      input.researchQuestion?.trim() || captured.researchQuestion,
    purpose: input.purpose?.trim() || captured.intendedOutcome,
    likelyIntendedOutcome: input.likelyIntendedOutcome ?? null,
    currentInformationRequired: Boolean(input.currentInformationRequired),
    sourcePreferences: [],
    returnContext: input.returnContext ?? null,
    createdAt: new Date().toISOString(),
  };
}

/** Queue Research This for the Research Library opening experience. */
export function queueResearchThis(
  input: Parameters<typeof buildContextualResearchRequest>[0],
): ContextualResearchRequest {
  const request = buildContextualResearchRequest(input);
  setPendingContextualResearch(request);
  return request;
}

export function contextualRequestOpeningText(
  request: ContextualResearchRequest,
): string {
  if (request.selectedText) {
    return `Research this: ${request.selectedText}`;
  }
  if (request.researchQuestion) return request.researchQuestion;
  return `Help me understand ${request.researchTopic}`;
}
