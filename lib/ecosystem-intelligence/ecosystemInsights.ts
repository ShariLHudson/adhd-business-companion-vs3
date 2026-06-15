/**
 * Ecosystem insights — health labels and explanations.
 */

import type { EcosystemHealth, EcosystemSnapshot } from "./types";
import { priorityLabel } from "./ecosystemPriority";

const HEALTH_LABELS: Record<EcosystemHealth, string> = {
  healthy: "Healthy",
  watch: "Watch",
  needs_support: "Needs support",
  strained: "Strained",
};

export function ecosystemHealthLabel(health: EcosystemHealth): string {
  return HEALTH_LABELS[health];
}

export function explainEcosystem(snapshot: EcosystemSnapshot): string {
  return [
    `User: ${ecosystemHealthLabel(snapshot.userState.health)}`,
    `Founder: ${ecosystemHealthLabel(snapshot.founderState.health)}`,
    `Priority: ${priorityLabel(snapshot.topSignal)}`,
    `Surface: ${snapshot.recommendedSurface}`,
    `${snapshot.suppressions.length} suppression(s) active`,
  ].join(" · ");
}

export function ecosystemSystemImprovement(
  snapshot: EcosystemSnapshot,
): string {
  if (snapshot.userState.health === "strained") {
    return "Strengthen recovery-first flows — reduce simultaneous offers.";
  }
  if (snapshot.suppressions.length >= 6) {
    return "Suppression working — keep one-suggestion rule strict.";
  }
  if (snapshot.topSignal === "opportunity_explore") {
    return "Opportunity surfacing is low priority — ensure it stays optional.";
  }
  if (snapshot.founderState.health === "needs_support") {
    return "Align Business OS and Chief of Staff with capacity messaging.";
  }
  return "Monitor noise — companion should feel simpler after orchestration.";
}
