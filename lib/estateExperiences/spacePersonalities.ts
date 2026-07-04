/**
 * Per-space arrival personality — sourced from Estate Brain.
 */

import type { EstateSpacePersonality } from "./types";
import { allEstateBrainEntries } from "@/lib/estateBrain/knowledgeRegistry";

function buildSpacePersonalities(): Record<string, EstateSpacePersonality> {
  const map: Record<string, EstateSpacePersonality> = {};
  for (const entry of allEstateBrainEntries()) {
    map[entry.spaceId] = {
      spaceId: entry.spaceId,
      experienceId: entry.experienceId,
      arrivalPrompt: entry.defaultGreeting,
      arrivalSuggestions: [...entry.suggestedActivities],
    };
  }
  return map;
}

export const ESTATE_SPACE_PERSONALITIES: Record<string, EstateSpacePersonality> =
  buildSpacePersonalities();

export function estateSpaceArrivalPrompt(spaceId: string): string | null {
  return ESTATE_SPACE_PERSONALITIES[spaceId]?.arrivalPrompt ?? null;
}

export function estateSpaceArrivalSuggestions(
  spaceId: string,
): readonly string[] {
  return ESTATE_SPACE_PERSONALITIES[spaceId]?.arrivalSuggestions ?? [];
}
