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

  const conflictId = conflicts[0]?.id;
  if (conflictId === "pricing_capacity_burden") {
    return "Should you raise the price, reduce the scope, or test a different structure so the offer becomes sustainable without unnecessarily disrupting current members?";
  }
  if (conflictId === "growth_capacity_overwhelm") {
    return "Should you stabilize capacity first, or is a limited growth test still safe?";
  }
  if (conflictId === "growth_pricing_revenue") {
    return "Is the strongest growth path more customers, better retention, or greater value from the customers you already serve?";
  }
  if (conflictId === "pricing_growth_demand") {
    return "Is price the real issue — or demand quality, conversion, or retention?";
  }
  if (conflictId === "hiring_growth" || conflictId === "hiring_capacity") {
    return "Is hiring the best way to relieve the work limiting you, or would simplifying, automating, or testing a contractor first fit better?";
  }
  if (conflictId === "offer_market") {
    return "Is the primary issue the offer itself, or who it is really for?";
  }
  if (conflictId === "growth_market_activity") {
    return "Are you having trouble reaching enough people, or are the people you reach not seeing the offer as a strong fit?";
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
