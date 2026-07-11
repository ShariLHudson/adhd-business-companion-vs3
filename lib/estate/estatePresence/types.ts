/**
 * Estate Presence — subtle environmental life layer types.
 */

export type EstatePresenceLayerKind =
  | "lantern"
  | "candle"
  | "fireplace"
  | "steam"
  | "leaves"
  | "dust"
  | "cloud-drift"
  | "water-ripple"
  | "curtain-sway"
  | "horse-calm"
  | "page-turn"
  | "compass-glow"
  | "wind-sway"
  | "bird-pass"
  | "lamp-glow"
  | "blossom-drift"
  | "apple-fall"
  | "drawer-settle"
  | "star-twinkle";

export type EstatePresenceLayer = {
  kind: EstatePresenceLayerKind;
  /** Position — percentage strings */
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  /** Stagger 1–4 — estate light flicker delays */
  delay?: 1 | 2 | 3 | 4;
  variant?: string;
};

export type EstatePresenceProfile = {
  roomId: string;
  layers: readonly EstatePresenceLayer[];
};
