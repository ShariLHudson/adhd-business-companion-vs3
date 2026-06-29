/** Signature Icon System — warm illustrated navigation language. */

export const SIGNATURE_ICON_ANIMATIONS = [
  "none",
  "window-glow",
  "sparkle-drift",
  "lantern-glow",
  "path-brighten",
  "block-tip",
  "page-glow",
  "lamp-glow",
  "sound-wave",
  "leaf-sway",
  "compass-turn",
  "candle-flicker",
] as const;

export type SignatureIconAnimation = (typeof SIGNATURE_ICON_ANIMATIONS)[number];

export const SIGNATURE_ICON_IDS = [
  "home-cottage",
  "clear-mind-brain",
  "plan-my-day",
  "focus-lantern-brain",
  "peaceful-path",
  "momentum-blocks",
  "library-journal",
  "study-lamp",
  "journal-pen",
  "voice-waves",
  "community-chairs",
  "learn-grow-tree",
  "support-hands",
  "decision-compass",
  "adhd-toolkit",
  "settings-key-gear",
] as const;

export type SignatureIconId = (typeof SIGNATURE_ICON_IDS)[number];

export type SignatureIconDef = {
  id: SignatureIconId;
  label: string;
  animation: SignatureIconAnimation;
};
