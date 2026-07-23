/**
 * Create Begin — member-facing outcomes:
 * 1) Confirm inferred type (high/medium confidence) — never silent create
 * 2) Clarify when ambiguous or low confidence
 * 3) Open only after member confirms (panel converts confirm → open)
 * Never silent no-op.
 *
 * Spec 131 — intent before artifact; medium confidence surfaces also-considered.
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
import { isBusinessPlanCreationRequest } from "@/lib/universalWorkEngine/packages/businessPlan/isBusinessPlanCreationRequest";
import { isMarketingPlanCreationRequest } from "@/lib/universalWorkEngine/packages/marketingPlan/isMarketingPlanCreationRequest";
import { isFacebookCommunityCreationRequest } from "@/lib/universalWorkEngine/packages/facebookCommunity/isFacebookCommunityCreationRequest";
import {
  createIntentAlternativesMessage,
  createIntentConfirmMessage,
  createIntentSoftConfirmMessage,
  detectPromotionalDeliverableIntent,
  humanCreateTypeLabel,
  limitAlsoConsidered,
  scoreCreateIntentConfidence,
  type CreateIntentConfidence,
} from "./createIntentConfirmation";
import { recordCreateIntentCorrection } from "./intentCorrectionHooks";

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
      isBusinessPlanDomain: boolean;
      isFacebookCommunityDomain: boolean;
      /** Spec 131 Rule 2 — also-considered when medium confidence */
      alsoConsidered?: string[];
    }
  | {
      kind: "open";
      text: string;
      artifactType: string;
      isEventDomain: boolean;
      isMarketingPlanDomain: boolean;
      isBusinessPlanDomain: boolean;
      isFacebookCommunityDomain: boolean;
    }
  | {
      kind: "error";
      message: string;
    };

type ResolvedArtifact = {
  artifactType: string;
  fromCatalog: boolean;
  fromPromptDetect: boolean;
  fromPromotionalIntent: boolean;
};

/** Gather plausible types for also-considered (does not create Work). */
function gatherCreateTypeCandidates(text: string): string[] {
  const out: string[] = [];
  const push = (v: string | null | undefined) => {
    const t = v?.trim();
    if (!t) return;
    if (out.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    out.push(t);
  };
  push(detectPromotionalDeliverableIntent(text));
  push(matchCatalogFromText(text)?.type ?? null);
  push(detectCreateTypeFromPrompt(text));
  if (isFacebookCommunityCreationRequest(text)) push("Facebook Community");
  if (isMarketingPlanCreationRequest(text)) push("Marketing Plan");
  if (isBusinessPlanCreationRequest(text)) push("Business Plan");
  if (isEventDomainCreationRequest(text)) push("Event Plan");

  // Spec 135 / 131 — when uncertain, surface up to 3 calm alternatives from wording.
  const t = text.toLowerCase();
  if (/\bworkshop\b/.test(t)) push("Workshop");
  if (/\b(retreat|webinar|summit|conference|event)\b/.test(t)) {
    push("Event Plan");
  }
  if (/\b(newsletter|email)\b/.test(t)) push("Newsletter");
  if (/\b(blog|article|post)\b/.test(t)) push("Blog Post");
  if (/\b(marketing|campaign|launch)\b/.test(t)) push("Marketing Plan");
  return out;
}

function resolveArtifactType(text: string): ResolvedArtifact | null {
  // Spec 131 Rule 1 — Intent before artifact (flyer for workshop ≠ Workshop).
  const promo = detectPromotionalDeliverableIntent(text);
  if (promo) {
    return {
      artifactType: promo,
      fromCatalog: false,
      fromPromptDetect: false,
      fromPromotionalIntent: true,
    };
  }

  // 587–598 — Facebook Community is a distinct guided experience. Resolve it
  // before the generic catalog match so "Facebook community/group" wording is
  // never mislabeled as a "Facebook Post" (or captured by a later word like
  // "clients"). Narrow detector — plain "Facebook post" still falls through.
  if (isFacebookCommunityCreationRequest(text)) {
    return {
      artifactType: "Facebook Community",
      fromCatalog: false,
      fromPromptDetect: false,
      fromPromotionalIntent: false,
    };
  }

  const catalogMatch = matchCatalogFromText(text)?.type?.trim() || null;
  if (catalogMatch) {
    return {
      artifactType: catalogMatch,
      fromCatalog: true,
      fromPromptDetect: false,
      fromPromotionalIntent: false,
    };
  }
  const fromPrompt = detectCreateTypeFromPrompt(text)?.trim() || null;
  if (fromPrompt) {
    return {
      artifactType: fromPrompt,
      fromCatalog: false,
      fromPromptDetect: true,
      fromPromotionalIntent: false,
    };
  }
  if (isMarketingPlanCreationRequest(text)) {
    return {
      artifactType: "Marketing Plan",
      fromCatalog: false,
      fromPromptDetect: false,
      fromPromotionalIntent: false,
    };
  }
  if (isBusinessPlanCreationRequest(text)) {
    return {
      artifactType: "Business Plan",
      fromCatalog: false,
      fromPromptDetect: false,
      fromPromotionalIntent: false,
    };
  }
  if (isEventDomainCreationRequest(text)) {
    return {
      artifactType: "Event Plan",
      fromCatalog: false,
      fromPromptDetect: false,
      fromPromotionalIntent: false,
    };
  }
  return null;
}

/** Shared domain flags for confirm / open outcomes. */
export function resolveGuidedCreateDomainFlags(input: {
  text: string;
  artifactType: string;
  fromPromotionalIntent?: boolean;
}): {
  isFacebookCommunityDomain: boolean;
  isMarketingPlanDomain: boolean;
  isBusinessPlanDomain: boolean;
  isEventDomain: boolean;
} {
  const label = input.artifactType;
  const text = input.text;
  const promo = Boolean(input.fromPromotionalIntent);

  const isFacebookCommunityDomain =
    (isFacebookCommunityCreationRequest(text) ||
      /facebook\s*(community|group)/i.test(label)) &&
    !promo;
  const isMarketingPlanDomain =
    !isFacebookCommunityDomain &&
    (isMarketingPlanCreationRequest(text) || /marketing\s+plan/i.test(label));
  const isBusinessPlanDomain =
    !isFacebookCommunityDomain &&
    !isMarketingPlanDomain &&
    (isBusinessPlanCreationRequest(text) || /business\s+plan/i.test(label));
  const isEventDomain =
    !isMarketingPlanDomain &&
    !isBusinessPlanDomain &&
    !isFacebookCommunityDomain &&
    !promo &&
    (isEventDomainCreationRequest(text) ||
      /\b(event|workshop|retreat|webinar|conference)\b/i.test(label));

  return {
    isFacebookCommunityDomain,
    isMarketingPlanDomain,
    isBusinessPlanDomain,
    isEventDomain,
  };
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
    isBusinessPlanDomain: outcome.isBusinessPlanDomain,
    isFacebookCommunityDomain: outcome.isFacebookCommunityDomain,
  };
}

/**
 * Spec 131 Rule 3 — switch most-likely without rewriting the request.
 * Keeps original text; updates type + message for re-confirm.
 */
export function switchCreateBeginConfirmType(
  outcome: Extract<CreateBeginOutcome, { kind: "confirm" }>,
  nextArtifactType: string,
): Extract<CreateBeginOutcome, { kind: "confirm" }> {
  const label = humanCreateTypeLabel(nextArtifactType);
  const previous = humanCreateTypeLabel(outcome.artifactType);
  // Spec 131 Rule 13 — session correction hook (Intent Memory™ still future).
  recordCreateIntentCorrection({
    requestText: outcome.text,
    fromType: previous,
    toType: label,
  });
  const also = limitAlsoConsidered(
    label,
    [
      previous,
      ...(outcome.alsoConsidered ?? []),
      ...gatherCreateTypeCandidates(outcome.text),
    ],
  );
  const domains = resolveGuidedCreateDomainFlags({
    text: outcome.text,
    artifactType: label,
  });

  return {
    kind: "confirm",
    text: outcome.text,
    artifactType: label,
    message:
      also.length > 0
        ? createIntentAlternativesMessage(label, also)
        : createIntentConfirmMessage(label),
    confidence: "high",
    ...domains,
    alsoConsidered: also.length > 0 ? also : undefined,
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
  const domains = resolveGuidedCreateDomainFlags({
    text,
    artifactType: label,
  });

  return {
    kind: "confirm",
    text,
    artifactType: label,
    message: createIntentConfirmMessage(label),
    confidence: "high",
    ...domains,
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

    const {
      isFacebookCommunityDomain,
      isMarketingPlanDomain,
      isBusinessPlanDomain,
      isEventDomain,
    } = resolveGuidedCreateDomainFlags({
      text,
      artifactType: resolved.artifactType,
      fromPromotionalIntent: resolved.fromPromotionalIntent,
    });

    // Event domain Begin historically required the event detector (not only label)
    // so catalog "Workshop" still qualifies when wording is event-like.
    const isEventDomainBegin =
      isEventDomain ||
      (isEventDomainCreationRequest(text) &&
        !isMarketingPlanDomain &&
        !isBusinessPlanDomain &&
        !isFacebookCommunityDomain &&
        !resolved.fromPromotionalIntent);

    const confidence = scoreCreateIntentConfidence({
      text,
      artifactType: resolved.artifactType,
      fromCatalog: resolved.fromCatalog,
      fromPromptDetect: resolved.fromPromptDetect,
      isMarketingPlanDomain,
      isBusinessPlanDomain,
      isEventDomain: isEventDomainBegin,
      isFacebookCommunityDomain,
      fromPromotionalIntent: resolved.fromPromotionalIntent,
    });

    if (confidence === "low") {
      return {
        kind: "clarify",
        message: CREATE_BEGIN_AMBIGUOUS_MESSAGE,
        reason: "low_confidence",
      };
    }

    const alsoConsidered =
      confidence === "medium"
        ? limitAlsoConsidered(
            resolved.artifactType,
            gatherCreateTypeCandidates(text),
          )
        : [];

    const message =
      confidence === "high"
        ? createIntentConfirmMessage(resolved.artifactType)
        : alsoConsidered.length > 0
          ? createIntentAlternativesMessage(
              resolved.artifactType,
              alsoConsidered,
            )
          : createIntentSoftConfirmMessage(resolved.artifactType);

    return {
      kind: "confirm",
      text,
      artifactType: resolved.artifactType,
      message,
      confidence,
      isEventDomain: isEventDomainBegin,
      isMarketingPlanDomain,
      isBusinessPlanDomain,
      isFacebookCommunityDomain,
      ...(alsoConsidered.length > 0 ? { alsoConsidered } : {}),
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
