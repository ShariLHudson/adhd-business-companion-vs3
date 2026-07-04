import type { JournalLeatherColor } from "./types";

export type LeatherPalette = {
  highlight: string;
  face: string;
  shadow: string;
  spine: string;
  edge: string;
};

export type LeatherTextureId =
  | "smooth-english"
  | "distressed-saddle"
  | "cross-grain"
  | "pebbled"
  | "fine-calf"
  | "linen-wrap";

export const JOURNAL_LEATHER_TEXTURES: Record<
  JournalLeatherColor,
  LeatherTextureId
> = {
  forest: "smooth-english",
  cognac: "distressed-saddle",
  midnight: "cross-grain",
  burgundy: "pebbled",
  espresso: "fine-calf",
  camel: "linen-wrap",
};

export const JOURNAL_LEATHER_PALETTES: Record<JournalLeatherColor, LeatherPalette> =
  {
    cognac: {
      highlight: "#a06848",
      face: "#8b5a3c",
      shadow: "#4a3020",
      spine: "#5c3a28",
      edge: "rgba(255, 240, 220, 0.14)",
    },
    espresso: {
      highlight: "#5a4034",
      face: "#3d2b22",
      shadow: "#1f1510",
      spine: "#2a1e18",
      edge: "rgba(255, 235, 215, 0.1)",
    },
    forest: {
      highlight: "#3f5f50",
      face: "#2f4a3e",
      shadow: "#1a2e26",
      spine: "#243d34",
      edge: "rgba(220, 240, 225, 0.12)",
    },
    midnight: {
      highlight: "#2e3f52",
      face: "#1e2a38",
      shadow: "#0f141c",
      spine: "#151e2a",
      edge: "rgba(210, 225, 245, 0.1)",
    },
    burgundy: {
      highlight: "#7a3d48",
      face: "#5c2e35",
      shadow: "#321820",
      spine: "#452228",
      edge: "rgba(255, 225, 225, 0.1)",
    },
    camel: {
      highlight: "#c4a574",
      face: "#a68b5b",
      shadow: "#6b5638",
      spine: "#8a7048",
      edge: "rgba(255, 245, 220, 0.12)",
    },
  };

export function leatherTextureId(color: JournalLeatherColor): LeatherTextureId {
  return JOURNAL_LEATHER_TEXTURES[color];
}

export function leatherCoverGradient(color: JournalLeatherColor): string {
  const p = JOURNAL_LEATHER_PALETTES[color];
  return `linear-gradient(145deg, ${p.highlight} 0%, ${p.face} 48%, ${p.shadow} 100%)`;
}

export function leatherSpineGradient(color: JournalLeatherColor): string {
  const p = JOURNAL_LEATHER_PALETTES[color];
  return `linear-gradient(90deg, ${p.shadow}, ${p.spine} 45%, ${p.shadow})`;
}
