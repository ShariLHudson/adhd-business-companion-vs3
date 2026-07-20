/**
 * Create Begin — exactly two member-facing outcomes:
 * 1) Open workspace with identified type + Current Focus
 * 2) Clarify when ambiguous
 * Never silent no-op.
 */

import { matchCatalogFromText } from "@/lib/createCatalog";
import { detectCreateTypeFromPrompt } from "@/lib/createProjects/canonicalWorkRecord";
import {
  CREATE_BEGIN_AMBIGUOUS_MESSAGE,
  CREATE_BEGIN_EMPTY_MESSAGE,
  CREATE_BEGIN_ERROR_MESSAGE,
} from "@/lib/primaryActionFeedback";
import { enterCreationFromCreate } from "@/lib/universalCreationEntrypoint";
import type { UniversalCreationEntrypointResult } from "@/lib/universalCreationEntrypoint/types";
import { isEventDomainCreationRequest } from "@/lib/universalCreationPlatform/oneCreationPlatform";

export type CreateBeginOutcome =
  | {
      kind: "clarify";
      message: string;
      reason: "empty" | "ambiguous" | "entrypoint_clarify";
    }
  | {
      kind: "open";
      text: string;
      artifactType: string;
      entry: UniversalCreationEntrypointResult;
      isEventDomain: boolean;
    }
  | {
      kind: "error";
      message: string;
    };

function resolveArtifactType(
  text: string,
  entry: UniversalCreationEntrypointResult,
): string | null {
  const fromBlueprint = entry.blueprint?.catalogType?.trim() || null;
  if (fromBlueprint) return fromBlueprint;
  const fromCatalog = matchCatalogFromText(text)?.type?.trim() || null;
  if (fromCatalog) return fromCatalog;
  const fromPrompt = detectCreateTypeFromPrompt(text)?.trim() || null;
  if (fromPrompt) return fromPrompt;
  if (entry.engineResult?.handled) return "Event Plan";
  if (isEventDomainCreationRequest(text)) return "Event Plan";
  return null;
}

/**
 * Resolve Begin click into open | clarify | error.
 * Always returns a member-visible outcome.
 */
export function resolveCreateBeginOutcome(userText: string): CreateBeginOutcome {
  const text = userText.trim();
  if (!text) {
    return {
      kind: "clarify",
      message: CREATE_BEGIN_EMPTY_MESSAGE,
      reason: "empty",
    };
  }

  try {
    const entry = enterCreationFromCreate({ userText: text });

    if (entry.action === "clarify") {
      return {
        kind: "clarify",
        message:
          entry.reply?.trim() ||
          entry.clarifyingQuestion?.trim() ||
          CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "entrypoint_clarify",
      };
    }

    const artifactType = resolveArtifactType(text, entry);
    if (!artifactType) {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "ambiguous",
      };
    }

    // Low-confidence / stay without a type → clarify (Create surface never silent)
    if (
      entry.action === "stay_conversation" &&
      entry.confidence === "low" &&
      !entry.blueprint?.catalogType
    ) {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "ambiguous",
      };
    }

    return {
      kind: "open",
      text,
      artifactType,
      entry,
      isEventDomain: isEventDomainCreationRequest(text),
    };
  } catch {
    return {
      kind: "error",
      message: CREATE_BEGIN_ERROR_MESSAGE,
    };
  }
}

export function createBeginOutcomeIsVisible(
  outcome: CreateBeginOutcome,
): boolean {
  if (outcome.kind === "open") return true;
  return Boolean(outcome.message.trim());
}
