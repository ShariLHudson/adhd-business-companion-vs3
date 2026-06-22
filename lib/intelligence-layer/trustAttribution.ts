/**
 * Sprint 2B-B PR 3 — Trust attribution MVP validation.
 * Uses Intervention Registry v1 for bucket identity.
 */

import {
  isRegisteredInterventionBucket,
  resolveOfferBucket,
  type InterventionBucket,
} from "./interventionRegistry";
import type { TrustProductId } from "./companionSession";

export type { TrustProductId } from "./companionSession";

export type TrustCausationType =
  | "user_action"
  | "system_suppressed"
  | "system_blocked";

const ALLOWED_CAUSATION = new Set<TrustCausationType>([
  "user_action",
  "system_suppressed",
  "system_blocked",
]);

export type TrustAttributionMvp = {
  productId: TrustProductId;
  sessionId: string;
  interventionBucket: InterventionBucket;
  causationType: TrustCausationType;
};

export type TrustAttributionValidationCode =
  | "missing_product_id"
  | "missing_session_id"
  | "missing_intervention_bucket"
  | "missing_causation_type"
  | "invalid_causation_type"
  | "unknown_intervention_bucket"
  | "system_causation_blocks_evolution";

export type TrustAttributionValidation =
  | {
      ok: true;
      attribution: TrustAttributionMvp;
      allowsEvolution: boolean;
    }
  | {
      ok: false;
      code: TrustAttributionValidationCode;
      detail: string;
    };

export type BuildTrustAttributionInput = {
  sessionId: string;
  causationType: TrustCausationType;
  productId?: TrustProductId;
  /** Stable bucket id or UI slug resolved via intervention registry. */
  interventionBucket?: string;
  offerKey?: string;
};

function resolveBucket(
  interventionBucket?: string,
  offerKey?: string,
): InterventionBucket | null {
  if (interventionBucket?.trim()) {
    const direct = interventionBucket.trim();
    if (isRegisteredInterventionBucket(direct)) {
      return direct;
    }
    return resolveOfferBucket(direct);
  }
  if (offerKey?.trim()) {
    return resolveOfferBucket(offerKey);
  }
  return null;
}

export type ValidateTrustAttributionInput = {
  productId?: string;
  sessionId?: string;
  interventionBucket?: string;
  offerKey?: string;
  causationType?: TrustCausationType;
};

export function buildTrustAttribution(
  input: BuildTrustAttributionInput,
): TrustAttributionValidation {
  return validateTrustAttribution({
    productId: input.productId ?? "ecosystem",
    sessionId: input.sessionId,
    interventionBucket: input.interventionBucket,
    offerKey: input.offerKey,
    causationType: input.causationType,
  });
}

export function validateTrustAttribution(
  input: ValidateTrustAttributionInput,
): TrustAttributionValidation {
  const productId = input.productId?.trim();
  if (!productId) {
    return {
      ok: false,
      code: "missing_product_id",
      detail: "productId is required",
    };
  }

  const sessionId = input.sessionId?.trim();
  if (!sessionId) {
    return {
      ok: false,
      code: "missing_session_id",
      detail: "sessionId is required",
    };
  }

  if (!input.causationType) {
    return {
      ok: false,
      code: "missing_causation_type",
      detail: "causationType is required",
    };
  }

  if (!ALLOWED_CAUSATION.has(input.causationType)) {
    return {
      ok: false,
      code: "invalid_causation_type",
      detail: `unsupported causationType: ${String(input.causationType)}`,
    };
  }

  const bucket = resolveBucket(input.interventionBucket, input.offerKey);
  if (!bucket) {
    const raw = input.interventionBucket ?? input.offerKey ?? "";
    if (!raw.trim()) {
      return {
        ok: false,
        code: "missing_intervention_bucket",
        detail: "interventionBucket or offerKey is required",
      };
    }
    return {
      ok: false,
      code: "unknown_intervention_bucket",
      detail: `unregistered intervention bucket: ${raw}`,
    };
  }

  const attribution: TrustAttributionMvp = {
    productId: productId as TrustProductId,
    sessionId,
    interventionBucket: bucket,
    causationType: input.causationType,
  };

  if (input.causationType !== "user_action") {
    return {
      ok: true,
      attribution,
      allowsEvolution: false,
    };
  }

  return {
    ok: true,
    attribution,
    allowsEvolution: true,
  };
}

export function allowsTrustEvolution(
  validation: TrustAttributionValidation,
): boolean {
  return validation.ok && validation.allowsEvolution;
}
