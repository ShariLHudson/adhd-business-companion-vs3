import type { FirstTimeExperienceId } from "./types";

export type FirstTimeExperienceDefinition = {
  id: FirstTimeExperienceId;
  label: string;
  /** Automatic presentation is allowed only when never completed. */
  mayAutoPresent: boolean;
  /** Where members can reopen intentionally */
  manualReplaySurfaces: readonly string[];
  /** Account-backed (cross-device) vs device/local cache */
  persistence: "account" | "local" | "account+local";
};

/**
 * Catalog of first-time experiences. Welcome audio is the gold standard;
 * others inherit the same once-only rule as they ship auto-presentation.
 */
export const FIRST_TIME_EXPERIENCE_REGISTRY: readonly FirstTimeExperienceDefinition[] =
  [
    {
      id: "welcome-audio",
      label: "First-Time Welcome (spoken)",
      mayAutoPresent: true,
      manualReplaySurfaces: ["Settings", "Help", "Estate menu"],
      persistence: "account+local",
    },
    {
      id: "welcome-home-cinematic",
      label: "Welcome Home cinematic arrival",
      mayAutoPresent: true,
      manualReplaySurfaces: ["Settings · Replay Welcome", "Estate menu"],
      persistence: "local",
    },
    {
      id: "estate-tour",
      label: "Estate Tour (in-panel)",
      mayAutoPresent: false,
      manualReplaySurfaces: ["How Everything Works Together"],
      persistence: "local",
    },
    {
      id: "how-everything-works-together",
      label: "How Everything Works Together",
      mayAutoPresent: false,
      manualReplaySurfaces: ["Help", "How Do I", "Show me how this fits together"],
      persistence: "local",
    },
    {
      id: "room-introduction",
      label: "Room introductions",
      mayAutoPresent: false,
      manualReplaySurfaces: ["Help"],
      persistence: "local",
    },
    {
      id: "feature-introduction",
      label: "Feature introductions",
      mayAutoPresent: false,
      manualReplaySurfaces: ["Help"],
      persistence: "local",
    },
  ] as const;

export function getFirstTimeExperienceDefinition(
  id: FirstTimeExperienceId,
): FirstTimeExperienceDefinition {
  const found = FIRST_TIME_EXPERIENCE_REGISTRY.find((e) => e.id === id);
  if (!found) {
    throw new Error(`Unknown first-time experience: ${id}`);
  }
  return found;
}
