/**
 * Spin the Wheel — Estate Decision Room presentation helpers.
 * Does not change choice storage or selection logic.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

export const SPIN_WHEEL_DECISION_ROOM_BG =
  `${estateBackgroundPath("decision-room-spin-wheel-background.png")}?v=20260713a` as const;

/** Fallback when the dedicated Decision Room asset is unavailable. */
export const SPIN_WHEEL_DECISION_ROOM_FALLBACK_BG = estateBackgroundPath(
  "room-library-estate-background.png",
);

const SOUND_KEY = "companion-spin-wheel-sound-v1";

export function isSpinWheelSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw === null) return true;
    return raw !== "0";
  } catch {
    return true;
  }
}

export function setSpinWheelSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Estate palette for wheel segments — teal, cream, gold, bronze. */
export const DECISION_WHEEL_SEGMENT_COLORS = [
  "#1e4f4f",
  "#f3ebe0",
  "#c4a35a",
  "#8b5e3c",
  "#2a6363",
  "#e8dcc8",
  "#a67c3a",
  "#5c3d2e",
] as const;

export function decisionWheelConicGradient(segmentCount: number): string {
  const n = Math.max(segmentCount, 1);
  const slice = 360 / n;
  const stops: string[] = [];
  for (let i = 0; i < n; i++) {
    const color =
      DECISION_WHEEL_SEGMENT_COLORS[i % DECISION_WHEEL_SEGMENT_COLORS.length]!;
    const start = i * slice;
    const end = (i + 1) * slice;
    stops.push(`${color} ${start}deg ${end}deg`);
  }
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
