import { JOURNAL_INK_OPTIONS } from "./catalog";
import type { JournalGazeboConfig, JournalPenStyle } from "./types";

export type PenRenderProfile = {
  /** CSS class on print sheets */
  penClass: string;
  fontWeight: number;
  letterSpacing: string;
  opacity: number;
  /** Resolved ink color after pen-specific adjustment */
  inkColor: string;
  textShadow: string;
  filter: string;
  webkitTextStroke: string;
};

function baseInk(config: JournalGazeboConfig): string {
  return JOURNAL_INK_OPTIONS.find((ink) => ink.id === config.inkColor)?.css ?? "#1c1816";
}

/** Graphite tone for pencil — softer than liquid ink. */
function pencilInk(ink: string): string {
  if (ink === "#1c1816") return "#6b6560";
  if (ink.startsWith("#") && ink.length === 7) {
    const r = parseInt(ink.slice(1, 3), 16);
    const g = parseInt(ink.slice(3, 5), 16);
    const b = parseInt(ink.slice(5, 7), 16);
    const mix = (channel: number) => Math.round(channel * 0.55 + 138 * 0.45);
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
  }
  return "#6b6560";
}

function fountainWeight(config: JournalGazeboConfig): number {
  if (config.nibSize === "fine") return 380;
  if (config.nibSize === "broad") return 520;
  return 420;
}

function fountainShadow(config: JournalGazeboConfig): string {
  if (config.nibSize === "broad") {
    return "0.1px 0.18px 0.12px rgba(0,0,0,0.1), 0.32px 0 0 currentColor";
  }
  return "0.06px 0.1px 0.08px rgba(0,0,0,0.08), 0.22px 0 0 currentColor";
}

/** Shared pen appearance for screen CSS variables and print export. */
export function penRenderProfile(config: JournalGazeboConfig): PenRenderProfile {
  const ink = baseInk(config);
  const pen = config.penStyle;

  if (pen === "pencil") {
    return {
      penClass: "pen-pencil",
      fontWeight: 380,
      letterSpacing: "0.02em",
      opacity: 0.84,
      inkColor: pencilInk(ink),
      textShadow: "0.15px 0.22px 0.45px rgba(100, 95, 90, 0.32), -0.08px 0 0 rgba(190, 185, 178, 0.18)",
      filter: "contrast(0.84) saturate(0.52)",
      webkitTextStroke: "0",
    };
  }

  if (pen === "gel") {
    return {
      penClass: "pen-felt",
      fontWeight: 680,
      letterSpacing: "-0.015em",
      opacity: 1,
      inkColor: ink,
      textShadow: "0 0 0.35px currentColor, 0.08px 0.12px 0.18px rgba(0,0,0,0.14)",
      filter: "saturate(1.08)",
      webkitTextStroke: "0.2px currentColor",
    };
  }

  if (pen === "ballpoint") {
    return {
      penClass: "pen-ballpoint",
      fontWeight: 540,
      letterSpacing: "0.01em",
      opacity: 0.96,
      inkColor: ink,
      textShadow: "0.04px 0.06px 0 rgba(0,0,0,0.06)",
      filter: "none",
      webkitTextStroke: "0",
    };
  }

  if (pen === "brush") {
    return {
      penClass: "pen-brush",
      fontWeight: 520,
      letterSpacing: "0.02em",
      opacity: 1,
      inkColor: ink,
      textShadow:
        "0.2px 0.35px 0.15px rgba(0,0,0,0.12), 0.45px 0 0 currentColor, -0.15px 0.25px 0 rgba(0,0,0,0.08)",
      filter: "saturate(1.05)",
      webkitTextStroke: "0.35px currentColor",
    };
  }

  return {
    penClass: "pen-fountain",
    fontWeight: fountainWeight(config),
    letterSpacing: config.nibSize === "fine" ? "0.045em" : config.nibSize === "broad" ? "0.02em" : "0.035em",
    opacity: 1,
    inkColor: ink,
    textShadow: fountainShadow(config),
    filter: "none",
    webkitTextStroke: "0",
  };
}

export function penStyleLabel(pen: JournalPenStyle): string {
  if (pen === "gel") return "felt tip";
  if (pen === "fountain") return "fountain pen";
  if (pen === "pencil") return "pencil";
  if (pen === "brush") return "brush pen";
  return "ballpoint";
}
