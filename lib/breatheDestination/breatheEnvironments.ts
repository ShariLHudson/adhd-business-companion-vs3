/**
 * Breathe visual environments — peaceful estate places behind the exercise.
 *
 * @see docs/protocols/BREATHE_FULL_SCREEN_EXPERIENCE.md
 */

export const BREATHE_PEACEFUL_GARDEN_IMAGE =
  "/backgrounds/breathing-exercise-background.png" as const;

export type BreatheEnvironmentId =
  | "peaceful-garden"
  | "forest-path"
  | "fireplace-room"
  | "aquarium-room"
  | "tea-conservatory"
  | "rainy-window"
  | "garden-swing";

export type BreatheEnvironmentDef = {
  id: BreatheEnvironmentId;
  label: string;
  imageUrl: string;
  objectPosition: string;
  /** contain preserves water, trees, and architecture; cover fills edge-to-edge. */
  objectFit: "contain" | "cover";
  imageOpacity: number;
};

export const DEFAULT_BREATHE_ENVIRONMENT_ID: BreatheEnvironmentId =
  "peaceful-garden";

/** Curated peaceful places — image paths added as estate artwork ships. */
export const BREATHE_ENVIRONMENTS: Record<
  BreatheEnvironmentId,
  BreatheEnvironmentDef
> = {
  "peaceful-garden": {
    id: "peaceful-garden",
    label: "Peaceful Garden",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.8,
  },
  "forest-path": {
    id: "forest-path",
    label: "Forest Path",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
  "fireplace-room": {
    id: "fireplace-room",
    label: "Fireplace Room",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
  "aquarium-room": {
    id: "aquarium-room",
    label: "Aquarium Room",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
  "tea-conservatory": {
    id: "tea-conservatory",
    label: "Tea Conservatory",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
  "rainy-window": {
    id: "rainy-window",
    label: "Rainy Window",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
  "garden-swing": {
    id: "garden-swing",
    label: "Garden Swing",
    imageUrl: BREATHE_PEACEFUL_GARDEN_IMAGE,
    objectPosition: "center center",
    objectFit: "contain",
    imageOpacity: 0.78,
  },
};

export function resolveBreatheEnvironment(
  id?: BreatheEnvironmentId | string | null,
): BreatheEnvironmentDef {
  if (id && id in BREATHE_ENVIRONMENTS) {
    return BREATHE_ENVIRONMENTS[id as BreatheEnvironmentId];
  }
  return BREATHE_ENVIRONMENTS[DEFAULT_BREATHE_ENVIRONMENT_ID];
}

export function breatheEnvironmentStyleVars(
  env: BreatheEnvironmentDef,
): Record<string, string> {
  return {
    "--breathe-env-image": `url("${env.imageUrl}")`,
    "--breathe-env-position": env.objectPosition,
    "--breathe-env-fit": env.objectFit,
    "--breathe-env-opacity": String(env.imageOpacity),
  };
}
