/**
 * Create Begin — member-facing outcomes:
 * 1) Confirm inferred type (high/medium confidence) — never silent create
 * 2) Clarify when ambiguous or low confidence
 * 3) Open only after member confirms (panel converts confirm → open)
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
import {
  createIntentConfirmMessage,
  createIntentSoftConfirmMessage,
  humanCreateTypeLabel,
  scoreCreateIntentConfidence,
  type CreateIntentConfidence,
} from "./createIntentConfirmation";

export type CreateBeginOutcome =
  | {
      kind: "clarify";
      message: string;
      reason: "empty" | "ambiguous" | "entrypoint_clarify" | "low_confidence";
    }
  | {
      kind: "confirm";
      text: string;
      artifactType: string;
      message: string;
      confidence: Exclude<CreateIntentConfidence, "low">;
      isEventDomain: boolean;
      isMarketingPlanDomain: boolean;
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

type ResolvedArtifact = {
  artifactType: string;
  fromCatalog: boolean;
  fromPromptDetect: boolean;
};

function resolveArtifactType(text: string): ResolvedArtifact | null {
  const catalogMatch = matchCatalogFromText(text)?.type?.trim() || null;
  if (catalogMatch) {
    return {
      artifactType: catalogMatch,
      fromCatalog: true,
      fromPromptDetect: false,
    };
  }
  const fromPrompt = detectCreateTypeFromPrompt(text)?.trim() || null;
  if (fromPrompt) {
    return {
      artifactType: fromPrompt,
      fromCatalog: false,
      fromPromptDetect: true,
    };
  }
  if (isMarketingPlanCreationRequest(text)) {
    return {
      artifactType: "Marketing Plan",
      fromCatalog: false,
      fromPromptDetect: false,
    };
  }
  if (isEventDomainCreationRequest(text)) {
    return {
      artifactType: "Event Plan",
      fromCatalog: false,
      fromPromptDetect: false,
    };
  }
  return null;
}

/** Convert a confirmed intent into the open outcome parents already wire. */
export function confirmCreateBeginToOpen(
  outcome: Extract<CreateBeginOutcome, { kind: "confirm" }>,
): Extract<CreateBeginOutcome, { kind: "open" }> {
  return {
    kind: "open",
    text: outcome.text,
    artifactType: outcome.artifactType,
    isEventDomain: outcome.isEventDomain,
    isMarketingPlanDomain: outcome.isMarketingPlanDomain,
  };
}

/**
 * Spec 130 — Browse Ideas / Guided Frameworks / recommendations.
 * Catalog picks still require explicit confirmation before Work exists.
 */
export function resolveCatalogCreateConfirm(input: {
  label: string;
  /** Optional member wording to preserve for titles */
  requestText?: string | null;
}): Extract<CreateBeginOutcome, { kind: "confirm" }> {
  const label = humanCreateTypeLabel(input.label);
  const text =
    input.requestText?.trim() ||
    `Create a ${label}`;
  const isMarketingPlanDomain =
    isMarketingPlanCreationRequest(text) || /marketing\s+plan/i.test(label);
  const isEventDomain =
    !isMarketingPlanDomain &&
    (isEventDomainCreationRequest(text) ||
      /\b(event|workshop|retreat|webinar|conference)\b/i.test(label));

  return {
    kind: "confirm",
    text,
    artifactType: label,
    message: createIntentConfirmMessage(label),
    confidence: "high",
    isEventDomain,
    isMarketingPlanDomain,
  };
}

/**
 * Resolve Begin click into confirm | clarify | error.
 * Never returns open — creation requires an explicit Yes.
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
    const resolved = resolveArtifactType(text);
    if (!resolved) {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "ambiguous",
      };
    }

    const isMarketingPlanDomain =
      isMarketingPlanCreationRequest(text) ||
      /marketing\s+plan/i.test(resolved.artifactType);
    const isEventDomain =
      isEventDomainCreationRequest(text) && !isMarketingPlanDomain;

    const confidence = scoreCreateIntentConfidence({
      text,
      artifactType: resolved.artifactType,
      fromCatalog: resolved.fromCatalog,
      fromPromptDetect: resolved.fromPromptDetect,
      isMarketingPlanDomain,
      isEventDomain,
    });

    if (confidence === "low") {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "low_confidence",
      };
    }

    return {
      kind: "confirm",
      text,
      artifactType: resolved.artifactType,
      message:
        confidence === "high"
          ? createIntentConfirmMessage(resolved.artifactType)
          : createIntentSoftConfirmMessage(resolved.artifactType),
      confidence,
      isEventDomain,
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
  if (outcome.kind === "confirm") return Boolean(outcome.message.trim());
  return Boolean(outcome.message.trim());
}
