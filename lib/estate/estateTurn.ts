/**
 * evaluateEstateTurn — Phase 1 turn evaluation (additive).
 *
 * Unifies member-need resolution for tests and future orchestration.
 * Does not replace estateCommandRouter yet — legacy paths remain active.
 *
 * @see docs/estate/SPARK_ESTATE_MASTER_PLAN.md
 */

import {
  evaluateMemberNeedFromPhrase,
  type EstateTurnResolution,
} from "./estateMemberNeedIndex";
import { resolveEstateMount } from "./estateMountRegistry";
import { resolvePlaceId } from "./placeIdAliases";

export type { EstateTurnResolution, MemberNeedId } from "./estateMemberNeedIndex";
export { evaluateMemberNeedFromPhrase } from "./estateMemberNeedIndex";

export type EstateTurnEvaluation = EstateTurnResolution & {
  /** Mount metadata when primary place resolves */
  primaryMount?: ReturnType<typeof resolveEstateMount>;
};

/**
 * Evaluate a member phrase for need → place → mount metadata.
 * Phase 1: need index only; does not call resolveEstatePlace or command router.
 */
export function evaluateEstateTurn(phrase: string): EstateTurnEvaluation {
  const resolution = evaluateMemberNeedFromPhrase(phrase);
  const primaryPlaceId = resolution.primaryPlaceId
    ? resolvePlaceId(resolution.primaryPlaceId)
    : resolution.placeIds[0]
      ? resolvePlaceId(resolution.placeIds[0])
      : undefined;

  const primaryMount = primaryPlaceId
    ? resolveEstateMount(primaryPlaceId) ?? undefined
    : undefined;

  return {
    ...resolution,
    primaryPlaceId,
    primaryMount,
  };
}
