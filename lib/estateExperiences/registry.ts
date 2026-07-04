/**
 * Estate Experiences™ — canonical experience map for Spark Estate.
 * **Source of truth:** `lib/estateBrain/knowledgeRegistry.ts` (Estate Brain).
 */

import type { EstateExperienceDefinition, EstateExperienceId } from "./types";
import { experiencesFromBrain } from "@/lib/estateBrain/adapters";
import { estateBrainEntryById } from "@/lib/estateBrain/knowledgeRegistry";

const FROM_BRAIN = experiencesFromBrain();

export const ESTATE_EXPERIENCES: Record<
  EstateExperienceId,
  EstateExperienceDefinition
> = Object.fromEntries(FROM_BRAIN.map((e) => [e.id, e])) as Record<
  EstateExperienceId,
  EstateExperienceDefinition
>;

export function estateExperienceById(
  id: EstateExperienceId,
): EstateExperienceDefinition {
  return ESTATE_EXPERIENCES[id];
}

export function estateExperienceArrivalPrompt(
  id: EstateExperienceId,
): string {
  return (
    estateBrainEntryById(id)?.defaultGreeting ??
    ESTATE_EXPERIENCES[id].arrivalPrompt
  );
}

export function estateExperienceDefaultSpace(id: EstateExperienceId): string {
  return ESTATE_EXPERIENCES[id].defaultSpaceId;
}
