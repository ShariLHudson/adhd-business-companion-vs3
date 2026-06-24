import type {
  EcosystemMajorSystem,
  FutureFirstEvaluation,
  ThreeLayerFeatureValue,
} from "./types";
import { getEcosystemMajorSystem } from "./systems";

/**
 * Final test before building any major feature:
 * 1. What value does this create today?
 * 2. What intelligence does this capture?
 * 3. What future systems could use this?
 */
export function evaluateFutureFirstFeature(input: {
  userValue?: string;
  intelligenceCaptures?: string[];
  futureEnables?: string[];
}): FutureFirstEvaluation {
  const userValueDefined = Boolean(input.userValue?.trim());
  const intelligenceValueDefined =
    Array.isArray(input.intelligenceCaptures) &&
    input.intelligenceCaptures.some((s) => s.trim().length > 0);
  const futureValueDefined =
    Array.isArray(input.futureEnables) &&
    input.futureEnables.some((s) => s.trim().length > 0);

  const blockers: string[] = [];
  if (!userValueDefined) {
    blockers.push("Define user value — what problem does this solve today?");
  }
  if (!intelligenceValueDefined) {
    blockers.push(
      "Define intelligence value — what can the ecosystem learn from this?",
    );
  }
  if (!futureValueDefined) {
    blockers.push(
      "Define future value — what future systems could use this data or architecture?",
    );
  }

  return {
    userValueDefined,
    intelligenceValueDefined,
    futureValueDefined,
    aligned: blockers.length === 0,
    blockers,
  };
}

export function evaluateRegisteredSystem(
  systemId: EcosystemMajorSystem["id"],
): FutureFirstEvaluation {
  const system = getEcosystemMajorSystem(systemId);
  if (!system) {
    return {
      userValueDefined: false,
      intelligenceValueDefined: false,
      futureValueDefined: false,
      aligned: false,
      blockers: [`Unknown system: ${systemId}`],
    };
  }
  return evaluateFutureFirstFeature(system.threeLayer);
}

export function assertFutureFirstAlignment(
  threeLayer: ThreeLayerFeatureValue,
): FutureFirstEvaluation {
  return evaluateFutureFirstFeature(threeLayer);
}

/** Building rule — architecture yes, premature feature sprawl no. */
export const FUTURE_FIRST_BUILDING_RULE =
  "Do not build future features now. Build today's features so future features are possible." as const;
