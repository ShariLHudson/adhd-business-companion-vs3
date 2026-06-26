/**
 * Safe Composition Engine™ — placement metadata per approved photograph.
 * Text, chat input, and logo follow image-specific safe zones, not global CSS.
 */

export type SubjectAnchor = "left" | "center" | "right";

export type CompositionZone = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  maxWidth?: string;
};

export type HospitalityPlacementZone =
  | "coffeeTable"
  | "bookshelf"
  | "windowSill"
  | "sideTable"
  | "floor"
  | "chair"
  | "wall"
  | "outsideWindow";

export type SafeCompositionEntry = {
  id: string;
  subjectAnchor: SubjectAnchor;
  photoObjectPosition: string;
  safeZones: {
    copyPanel: CompositionZone;
    chat: CompositionZone;
    logo?: CompositionZone;
  };
  /** Zones where we never overlay UI (face, hands, photographed props). */
  forbiddenZones: string[];
  /** Photograph already includes brand on mug — skip separate logo. */
  hideLogo?: boolean;
  mobileCrop: string;
  desktopCrop: string;
};

const WELCOME_HERO: SafeCompositionEntry = {
  id: "shari-i-am-here-2",
  subjectAnchor: "left",
  photoObjectPosition: "20% center",
  safeZones: {
    copyPanel: {
      top: "clamp(6%, 10vh, 14%)",
      right: "clamp(1.25rem, 3vw, 2.75rem)",
      width: "min(40%, 32rem)",
      maxWidth: "32rem",
    },
    chat: {
      left: "50%",
      bottom: "max(1.2rem, env(safe-area-inset-bottom))",
      width: "min(36rem, calc(100% - 2rem))",
    },
    logo: {
      left: "1rem",
      bottom: "max(1rem, env(safe-area-inset-bottom))",
      width: "clamp(5rem, 9vw, 7.25rem)",
    },
  },
  forbiddenZones: ["face", "hands", "mug", "candle", "bookshelf", "main-table"],
  hideLogo: true,
  mobileCrop: "keep-face-and-chat",
  desktopCrop: "wide-room",
};

const COFFEE_CUP: SafeCompositionEntry = {
  id: "shari-coffee-cup",
  subjectAnchor: "left",
  photoObjectPosition: "28% center",
  safeZones: {
    copyPanel: {
      top: "clamp(8%, 11vh, 15%)",
      right: "clamp(1rem, 2.5vw, 2rem)",
      width: "min(42%, 28rem)",
      maxWidth: "28rem",
    },
    chat: {
      left: "50%",
      bottom: "max(1.2rem, env(safe-area-inset-bottom))",
      width: "min(36rem, calc(100% - 2rem))",
    },
    logo: {
      left: "1rem",
      bottom: "max(1rem, env(safe-area-inset-bottom))",
      width: "clamp(4.5rem, 8vw, 6.5rem)",
    },
  },
  forbiddenZones: ["face", "hands", "mug", "steam"],
  hideLogo: false,
  mobileCrop: "center-mug",
  desktopCrop: "coffee-warmth",
};

const EVENING_WINDDOWN: SafeCompositionEntry = {
  id: "shari-evening-winddown",
  subjectAnchor: "left",
  photoObjectPosition: "22% center",
  safeZones: {
    copyPanel: {
      top: "clamp(7%, 10vh, 13%)",
      right: "clamp(1.25rem, 3vw, 2.5rem)",
      width: "min(38%, 30rem)",
      maxWidth: "30rem",
    },
    chat: {
      left: "50%",
      bottom: "max(1.2rem, env(safe-area-inset-bottom))",
      width: "min(36rem, calc(100% - 2rem))",
    },
    logo: {
      left: "1rem",
      bottom: "max(1rem, env(safe-area-inset-bottom))",
      width: "clamp(5rem, 9vw, 7rem)",
    },
  },
  forbiddenZones: ["face", "hands", "lamp", "window-sky"],
  hideLogo: false,
  mobileCrop: "keep-lamp-glow",
  desktopCrop: "evening-room",
};

export const SAFE_COMPOSITION_REGISTRY: SafeCompositionEntry[] = [
  WELCOME_HERO,
  COFFEE_CUP,
  EVENING_WINDDOWN,
];

export function compositionForImage(imageId: string): SafeCompositionEntry {
  return (
    SAFE_COMPOSITION_REGISTRY.find((entry) => entry.id === imageId) ?? WELCOME_HERO
  );
}

export function compositionZoneToStyle(
  zone: CompositionZone,
): Record<string, string> {
  const style: Record<string, string> = {};
  if (zone.top) style.top = zone.top;
  if (zone.right) style.right = zone.right;
  if (zone.bottom) style.bottom = zone.bottom;
  if (zone.left) style.left = zone.left;
  if (zone.width) style.width = zone.width;
  if (zone.maxWidth) style.maxWidth = zone.maxWidth;
  return style;
}
