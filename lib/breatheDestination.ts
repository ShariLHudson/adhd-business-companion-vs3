/**
 * Breathe Universal Access — full-screen destination, not a room overlay.
 * Temporarily replaces the current scene; prior workspace stays mounted in memory.
 */

import type { BreatheEnvironmentId } from "./breatheDestination/breatheEnvironments";

export type BreatheDestinationPhase = "entering" | "active" | "exiting";

/** Room ↔ Breathe crossfade (250–400 ms). */
export const BREATHE_DESTINATION_FADE_MS = 320;

export type BreatheDestinationState = {
  phase: BreatheDestinationPhase | null;
  patternId?: string;
  minutes?: number;
  /** Peaceful estate visual — defaults to Peaceful Garden. */
  environmentId?: BreatheEnvironmentId;
  key: number;
};

export const EMPTY_BREATHE_DESTINATION: BreatheDestinationState = {
  phase: null,
  key: 0,
};

export function isBreatheDestinationActive(
  state: BreatheDestinationState,
): boolean {
  return state.phase != null;
}
