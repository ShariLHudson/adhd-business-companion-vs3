/**
 * Lifecycle / ownership metadata attached to blueprint identity (100 Phase A).
 * Structure remains in BlueprintDefinition; this is intelligence + permissions prep.
 */

import type {
  BlueprintLifecycleStatus,
  BlueprintVisibility,
} from "./intelligenceTypes";

export type BlueprintIntelligenceProfile = {
  blueprintId: string;
  ownerId: string;
  visibility: BlueprintVisibility;
  status: BlueprintLifecycleStatus;
  purpose?: string;
  intendedUsers?: string[];
  intendedOutcomes?: string[];
  learningEnabled: boolean;
  updatedAt: string;
};

const profiles = new Map<string, BlueprintIntelligenceProfile>();

export function resetBlueprintProfilesForTests(): void {
  profiles.clear();
}

export function getBlueprintIntelligenceProfile(
  blueprintId: string,
): BlueprintIntelligenceProfile | null {
  return profiles.get(blueprintId) ?? null;
}

export function upsertBlueprintIntelligenceProfile(
  input: Partial<BlueprintIntelligenceProfile> & { blueprintId: string },
): BlueprintIntelligenceProfile {
  const prev = profiles.get(input.blueprintId);
  const next: BlueprintIntelligenceProfile = {
    blueprintId: input.blueprintId,
    ownerId: input.ownerId ?? prev?.ownerId ?? "member",
    visibility:
      input.visibility ??
      prev?.visibility ??
      (input.blueprintId.startsWith("bp-event-") ? "system" : "private"),
    status: input.status ?? prev?.status ?? "draft",
    purpose: input.purpose ?? prev?.purpose,
    intendedUsers: input.intendedUsers ?? prev?.intendedUsers,
    intendedOutcomes: input.intendedOutcomes ?? prev?.intendedOutcomes,
    learningEnabled: input.learningEnabled ?? prev?.learningEnabled ?? true,
    updatedAt: new Date().toISOString(),
  };
  profiles.set(input.blueprintId, next);
  return next;
}

export function resolveBlueprintVisibility(
  blueprintId: string,
  category: string,
): BlueprintVisibility {
  const profile = profiles.get(blueprintId);
  if (profile) return profile.visibility;
  if (category === "spark") return "system";
  return "private";
}

export function resolveBlueprintLifecycleStatus(
  blueprintId: string,
): BlueprintLifecycleStatus {
  return profiles.get(blueprintId)?.status ?? "draft";
}
