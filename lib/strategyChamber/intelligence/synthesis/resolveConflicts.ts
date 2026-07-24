/**
 * Conflict detection and resolution priorities.
 * Never expose technical conflict records to members.
 *
 * Resolution order (material conflicts):
 * 1. Confirmed user goals and values
 * 2. Safety / major harm prevention
 * 3. Hard constraints
 * 4. Real capacity
 * 5. Stronger evidence
 * 6. Customer trust / existing commitments
 * 7. Reversibility
 * 8. Bounded experiment ability
 * 9. Preservation of future options
 * 10. User preference
 */

import type { StrategyTypeId } from "../types";
import type {
  StrategySynthesisConflict,
  StrategySynthesisConflictResolutionMethod,
} from "./types";

type PairConflictRule = {
  id: string;
  primary: StrategyTypeId;
  secondary: StrategyTypeId;
  issue: string;
  primaryPosition: string;
  secondaryPosition: string;
  materiality: "low" | "moderate" | "high";
  resolutionMethod: StrategySynthesisConflictResolutionMethod;
  resolution: string;
  secondaryRestraintWins?: boolean;
};

const PAIR_RULES: PairConflictRule[] = [
  {
    id: "growth_capacity_overwhelm",
    primary: "growth",
    secondary: "capacity_focus",
    issue: "growth vs capacity",
    primaryPosition: "Explore growth paths and readiness.",
    secondaryPosition: "Delivery and founder capacity may block healthy growth.",
    materiality: "high",
    resolutionMethod: "capacity_priority",
    resolution:
      "Prefer stabilize, simplify, or a limited test before acquisition or expansion.",
    secondaryRestraintWins: true,
  },
  {
    id: "pricing_capacity_burden",
    primary: "pricing",
    secondary: "capacity_focus",
    issue: "price vs delivery burden",
    primaryPosition: "Consider price, packaging, and value.",
    secondaryPosition: "Delivery load may need scope or boundaries, not only a raise.",
    materiality: "high",
    resolutionMethod: "shared_constraint",
    resolution:
      "Compare raise, reduce scope, and change both — do not assume a raise alone.",
    secondaryRestraintWins: true,
  },
  {
    id: "growth_pricing_revenue",
    primary: "growth",
    secondary: "pricing",
    issue: "volume vs value",
    primaryPosition: "Diagnose the growth constraint.",
    secondaryPosition: "Revenue may need price or value-per-customer.",
    materiality: "high",
    resolutionMethod: "evidence_priority",
    resolution:
      "Do not recommend more customers by default when volume is already present.",
  },
  {
    id: "pricing_growth_demand",
    primary: "pricing",
    secondary: "growth",
    issue: "price vs demand",
    primaryPosition: "A higher price may protect sustainability.",
    secondaryPosition: "Weak demand may mean a raise creates acquisition friction.",
    materiality: "high",
    resolutionMethod: "experiment",
    resolution:
      "Use evidence and a bounded new-customer test before a broad raise.",
  },
  {
    id: "hiring_growth",
    primary: "hiring_delegation",
    secondary: "growth",
    issue: "hire vs growth constraint",
    primaryPosition: "Hiring or delegation may relieve work.",
    secondaryPosition: "Hiring only helps if it removes the real growth constraint.",
    materiality: "moderate",
    resolutionMethod: "ask_user",
    resolution: "Do not assume a hire is required — clarify the constraint first.",
  },
  {
    id: "hiring_capacity",
    primary: "hiring_delegation",
    secondary: "capacity_focus",
    issue: "hire vs simplification",
    primaryPosition: "A hire may relieve overload.",
    secondaryPosition: "Simplification or a contractor trial may fit first.",
    materiality: "high",
    resolutionMethod: "staged_option",
    resolution: "Identify work that does not require you before a permanent hire.",
    secondaryRestraintWins: true,
  },
  {
    id: "offer_market",
    primary: "offer",
    secondary: "market_customer",
    issue: "offer vs audience",
    primaryPosition: "Offer design and validation.",
    secondaryPosition: "Audience and positioning may be unclear.",
    materiality: "high",
    resolutionMethod: "ask_user",
    resolution:
      "Identify whether the offer or the audience is the primary issue before building.",
  },
  {
    id: "capacity_growth_ask",
    primary: "capacity_focus",
    secondary: "growth",
    issue: "capacity vs growth ambition",
    primaryPosition: "Protect focus and sustainable load.",
    secondaryPosition: "Growth may still be desired later.",
    materiality: "moderate",
    resolutionMethod: "capacity_priority",
    resolution: "Stabilize or simplify first; stage growth after capacity recovers.",
    secondaryRestraintWins: true,
  },
  {
    id: "growth_market_activity",
    primary: "growth",
    secondary: "market_customer",
    issue: "activity vs qualified demand",
    primaryPosition: "Growth path and acquisition.",
    secondaryPosition: "Audience fit may be the real gap.",
    materiality: "moderate",
    resolutionMethod: "evidence_priority",
    resolution: "Distinguish attention from qualified demand — do not default to posting more.",
  },
];

function preferClarify(method: StrategySynthesisConflictResolutionMethod): boolean {
  return method === "ask_user" || method === "experiment";
}

export function detectSynthesisConflicts(
  primaryId: StrategyTypeId,
  secondaryId: StrategyTypeId | undefined,
  text: string,
): StrategySynthesisConflict[] {
  if (!secondaryId) return [];
  const t = text.toLowerCase();
  const conflicts: StrategySynthesisConflict[] = [];

  for (const rule of PAIR_RULES) {
    if (rule.primary !== primaryId || rule.secondary !== secondaryId) continue;
    const material =
      (rule.id.includes("capacity") &&
        /overwhelm|burn|too much|cannot keep|can't keep|capacity|delivery/.test(
          t,
        )) ||
      (rule.id.includes("pricing") &&
        /price|charge|revenue|underpriced|fee/.test(t)) ||
      (rule.id.includes("growth") &&
        /grow|growth|customers|revenue|scale|expand|posting/.test(t)) ||
      (rule.id.includes("hiring") && /hire|va|assistant|delegate/.test(t)) ||
      (rule.id.includes("offer") && /offer|program|audience|who/.test(t)) ||
      (rule.id.includes("market") && /audience|fit|customers|posting|who/.test(t)) ||
      rule.id === "capacity_growth_ask";
    if (!material) continue;
    conflicts.push({
      id: rule.id,
      primaryDomainId: primaryId,
      secondaryDomainId: secondaryId,
      issue: rule.issue,
      primaryPosition: rule.primaryPosition,
      secondaryPosition: rule.secondaryPosition,
      materiality: rule.materiality,
      resolutionMethod: rule.resolutionMethod,
      resolution: rule.resolution,
      preferClarify: preferClarify(rule.resolutionMethod),
    });
  }

  return conflicts;
}

export function secondaryRestraintShouldBiasOptions(
  primaryId: StrategyTypeId,
  secondaryId: StrategyTypeId | undefined,
): boolean {
  if (!secondaryId) return false;
  return PAIR_RULES.some(
    (r) =>
      r.primary === primaryId &&
      r.secondary === secondaryId &&
      r.secondaryRestraintWins,
  );
}

/** Member-facing distinction — no domain labels. */
export function memberFacingConflictDistinction(
  conflict: StrategySynthesisConflict,
): string {
  return (
    conflict.resolution ||
    "There may be two questions mixed together here — we can take them one at a time."
  );
}
