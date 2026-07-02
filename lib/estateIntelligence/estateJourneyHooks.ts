/**
 * Estate Journey hooks — latent steps + journey intelligence context.
 */

import { estateJourneyIntelligenceHint } from "@/lib/estateJourneyEngine/intelligence";
import { estateRegistryEntryById } from "./estateRegistry";
import type { EstateRegistryEntry, EstateRouteResult } from "./types";

export type EstateLatentJourneyStep = {
  entryId: string;
  name: string;
  journeyRole?: EstateRegistryEntry["journeyRole"];
};

/** Ordered latent steps — primary invitation stays one; others are conversation-only context. */
export function latentJourneySteps(
  route: EstateRouteResult | null,
): EstateLatentJourneyStep[] {
  if (!route) return [];

  const steps: EstateLatentJourneyStep[] = [];
  for (const relatedId of route.primaryEntry.relatedEntryIds ?? []) {
    const related = estateRegistryEntryById(relatedId);
    if (!related) continue;
    steps.push({
      entryId: related.id,
      name: related.name,
      journeyRole: related.journeyRole,
    });
  }
  return steps;
}

export function latentJourneyHintForChat(
  steps: EstateLatentJourneyStep[],
): string | null {
  if (steps.length === 0) return null;
  const names = steps.map((s) => s.name).join(" → ");
  const parts = [
    "LATENT ESTATE JOURNEY (do not offer as a menu — one primary invitation only):",
    `Natural follow-ons if helpful later: ${names}`,
    "Mention only if conversation naturally opens — never list as numbered choices.",
  ];
  const intelligence = estateJourneyIntelligenceHint();
  if (intelligence) parts.push(intelligence);
  return parts.join("\n");
}
