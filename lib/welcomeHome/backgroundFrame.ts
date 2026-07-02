/**
 * Welcome Home background — true edge-to-edge cover (no letterboxing).
 * Scale ≥ 1 crops any baked-in black frame on the art asset.
 */

export const WELCOME_HOME_OBJECT_POSITION = "50% 40%" as const;

export const WELCOME_HOME_EDGE_COLOR = "#e4dbd0" as const;

export type WelcomeHomeBackgroundFrame = {
  objectFit: "cover";
  objectPosition: string;
  imageTransform: string;
  transformOrigin: string;
};

/** progress 0 = intro wide; 1 = settled — always fills viewport. */
export function welcomeHomeBackgroundFrame(
  progress: number,
): WelcomeHomeBackgroundFrame {
  const p = Math.max(0, Math.min(1, progress));
  const ease = 1 - (1 - p) ** 2;
  const scale = 1.14 - ease * 0.04;

  return {
    objectFit: "cover",
    objectPosition: WELCOME_HOME_OBJECT_POSITION,
    imageTransform: `scale(${scale})`,
    transformOrigin: "50% 42%",
  };
}
