/**
 * Create Begin — exactly two member-facing outcomes:
 * 1) Open workspace with identified type + Current Focus
 * 2) Clarify when ambiguous
 * Never silent no-op.
 *
 * Leaf-only — no universalCreationEntrypoint / Events barrel
 * (Vercel/Turbopack: Create Entrance must not init Events ↔ registry SCC).
 */

import { matchCatalogFromText } from "@/lib/createCatalog";
import { detectCreateTypeFromPrompt } from "@/lib/createProjects/canonicalWorkRecord";
import {
  CREATE_BEGIN_AMBIGUOUS_MESSAGE,
  CREATE_BEGIN_EMPTY_MESSAGE,
  CREATE_BEGIN_ERROR_MESSAGE,
} from "@/lib/primaryActionFeedback";
import { isEventDomainCreationRequest } from "@/lib/universalCreationPlatform/oneCreationPlatform";
import { isMarketingPlanCreationRequest } from "@/lib/universalWorkEngine/packages/marketingPlan/isMarketingPlanCreationRequest";

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
      isEventDomain: boolean;
      isMarketingPlanDomain: boolean;
    }
  | {
      kind: "error";
      message: string;
    };

function resolveArtifactType(text: string): string | null {
  const fromCatalog = matchCatalogFromText(text)?.type?.trim() || null;
  if (fromCatalog) return fromCatalog;
  const fromPrompt = detectCreateTypeFromPrompt(text)?.trim() || null;
  if (fromPrompt) return fromPrompt;
  if (isMarketingPlanCreationRequest(text)) return "Marketing Plan";
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
    const artifactType = resolveArtifactType(text);
    if (!artifactType) {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "ambiguous",
      };
    }

    const isMarketingPlanDomain =
      isMarketingPlanCreationRequest(text) ||
      /marketing\s+plan/i.test(artifactType);
    return {
      kind: "open",
      text,
      artifactType,
      isEventDomain:
        isEventDomainCreationRequest(text) && !isMarketingPlanDomain,
      isMarketingPlanDomain,
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
