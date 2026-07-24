/**
 * One integrated strategic question — never “Pricing says…” / “Growth says…”.
 */

import type { StrategyTypeId } from "../types";
import type { StrategySynthesisConflict } from "./types";

export function synthesizeStrategicQuestion(input: {
  primaryId: StrategyTypeId;
  secondaryId?: StrategyTypeId;
  surfaceStatement: string;
  conflicts: StrategySynthesisConflict[];
  underlyingHints: string[];
}): string {
  const { primaryId, secondaryId, surfaceStatement, conflicts, underlyingHints } =
    input;
  const surface = surfaceStatement.trim();
  const lower = surface.toLowerCase();

  if (conflicts[0]?.preferClarify) {
    if (conflicts[0].id === "pricing_capacity_burden") {
      return "Is the strongest move to raise the price, reduce the scope, or change both?";
    }
    if (conflicts[0].id === "growth_capacity_overwhelm") {
      return "Should you stabilize capacity first, or is a limited growth test still safe?";
    }
    if (conflicts[0].id === "growth_pricing_revenue") {
      return "Is the stronger path more customers, more value per customer, or better pricing?";
    }
    if (conflicts[0].id === "pricing_growth_demand") {
      return "Is price the real issue — or demand quality, conversion, or retention?";
    }
    if (conflicts[0].id === "hiring_growth") {
      return "Is hiring required for growth, or would simplification or a smaller test come first?";
    }
    if (conflicts[0].id === "offer_market") {
      return "Is the primary issue the offer itself, or who it is really for?";
    }
  }

  if (
    primaryId === "pricing" &&
    secondaryId === "capacity_focus" &&
    /too much|doing too much/.test(lower)
  ) {
    return "Is the strongest move to raise the price, reduce the scope, or change both?";
  }
  if (
    primaryId === "growth" &&
    secondaryId === "pricing" &&
    /plenty of customers|revenue is still low/.test(lower)
  ) {
    return "With enough customers already, what would raise revenue without chasing more volume?";
  }
  if (
    primaryId === "growth" &&
    secondaryId === "capacity_focus" &&
    /overwhelm|cannot keep|can't keep/.test(lower)
  ) {
    return "What needs to stabilize before growth would be healthy?";
  }

  if (underlyingHints[0]) {
    return underlyingHints[0];
  }

  if (surface) {
    return surface.endsWith("?") ? surface : `What is the real decision in: ${surface}?`;
  }

  return "What is the real strategic decision here?";
}
