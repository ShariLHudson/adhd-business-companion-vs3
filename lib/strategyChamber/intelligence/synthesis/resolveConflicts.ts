/**
 * Detect and resolve conflicts between primary and secondary domain stances.
 * Primary remains authority unless secondary is a hard capacity / sustainability veto.
 */

import type { StrategyTypeId } from "../types";
import type { StrategySynthesisConflict } from "./types";

const PAIR_RULES: Array<{
  id: string;
  primary: StrategyTypeId;
  secondary: StrategyTypeId;
  topic: string;
  primaryStance: string;
  secondaryStance: string;
  resolution: string;
  preferClarify: boolean;
  /** When true, secondary capacity restraint wins over expand/raise defaults. */
  secondaryRestraintWins?: boolean;
}> = [
  {
    id: "growth_capacity_overwhelm",
    primary: "growth",
    secondary: "capacity_focus",
    topic: "growth vs capacity",
    primaryStance: "Explore growth paths and readiness.",
    secondaryStance: "Delivery and founder capacity may block healthy growth.",
    resolution:
      "Prefer stabilize, simplify, or limited test before acquisition or expansion.",
    preferClarify: true,
    secondaryRestraintWins: true,
  },
  {
    id: "pricing_capacity_burden",
    primary: "pricing",
    secondary: "capacity_focus",
    topic: "price vs delivery burden",
    primaryStance: "Consider price, packaging, and value.",
    secondaryStance: "Delivery load may need scope or boundaries, not only a raise.",
    resolution:
      "Compare raise, reduce scope, and change both — do not assume a raise alone.",
    preferClarify: true,
    secondaryRestraintWins: true,
  },
  {
    id: "growth_pricing_revenue",
    primary: "growth",
    secondary: "pricing",
    topic: "volume vs value",
    primaryStance: "Diagnose the growth constraint.",
    secondaryStance: "Revenue may need price or value-per-customer.",
    resolution:
      "Do not recommend more customers by default when volume is already present.",
    preferClarify: true,
  },
  {
    id: "pricing_growth_demand",
    primary: "pricing",
    secondary: "growth",
    topic: "price vs demand",
    primaryStance: "Price may or may not be the problem.",
    secondaryStance: "Conversion, audience, or retention may be the real gap.",
    resolution:
      "Diagnose whether price, demand quality, or conversion is binding before changing price.",
    preferClarify: true,
  },
  {
    id: "hiring_growth",
    primary: "hiring_delegation",
    secondary: "growth",
    topic: "hire vs growth constraint",
    primaryStance: "Hiring or delegation may relieve work.",
    secondaryStance: "Hiring only helps if it removes the real growth constraint.",
    resolution: "Do not assume a hire is required — test constraint first.",
    preferClarify: true,
  },
  {
    id: "offer_market",
    primary: "offer",
    secondary: "market_customer",
    topic: "offer vs audience",
    primaryStance: "Offer design and validation.",
    secondaryStance: "Audience and positioning may be unclear.",
    resolution:
      "Identify whether the offer or the audience is the primary issue before options.",
    preferClarify: true,
  },
  {
    id: "capacity_growth_ask",
    primary: "capacity_focus",
    secondary: "growth",
    topic: "capacity vs growth ambition",
    primaryStance: "Protect focus and sustainable load.",
    secondaryStance: "Growth may still be desired later.",
    resolution: "Stabilize or simplify first; stage growth after capacity recovers.",
    preferClarify: false,
    secondaryRestraintWins: true,
  },
];

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
    // Only surface when language makes the tension material
    const material =
      (rule.id.includes("capacity") &&
        /overwhelm|burn|too much|cannot keep|can't keep|capacity|delivery/.test(
          t,
        )) ||
      (rule.id.includes("pricing") &&
        /price|charge|revenue|underpriced|fee/.test(t)) ||
      (rule.id.includes("growth") &&
        /grow|growth|customers|revenue|scale|expand/.test(t)) ||
      (rule.id.includes("hiring") && /hire|va|assistant|delegate/.test(t)) ||
      (rule.id.includes("offer") && /offer|program|audience|who/.test(t)) ||
      rule.id === "capacity_growth_ask";
    if (!material) continue;
    conflicts.push({
      id: rule.id,
      topic: rule.topic,
      primaryStance: rule.primaryStance,
      secondaryStance: rule.secondaryStance,
      resolution: rule.resolution,
      preferClarify: rule.preferClarify,
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
