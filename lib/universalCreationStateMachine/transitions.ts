/**
 * 061 — Allowed transitions (forward + natural reverse).
 */

import type { UniversalCreationState } from "./types";

const FORWARD: Record<UniversalCreationState, UniversalCreationState[]> = {
  idea: ["discovery", "archive"],
  discovery: ["foundation", "idea", "archive"],
  foundation: ["planning", "discovery", "archive"],
  planning: ["building", "review", "foundation", "archive"],
  building: ["review", "planning", "archive"],
  review: ["ready", "building", "planning", "archive"],
  ready: ["executing", "review", "building", "archive"],
  executing: ["completed", "review", "ready", "archive"],
  completed: ["growth", "archive", "reuse", "executing"],
  growth: ["reuse", "archive", "completed", "planning"],
  archive: ["reuse", "growth", "planning"],
  reuse: ["discovery", "foundation", "planning", "archive"],
};

export function isAllowedUniversalTransition(
  from: UniversalCreationState,
  to: UniversalCreationState,
): boolean {
  if (from === to) return true;
  return FORWARD[from]?.includes(to) ?? false;
}

export function nextLikelyUniversalState(
  state: UniversalCreationState,
): UniversalCreationState | null {
  const options = FORWARD[state];
  if (!options?.length) return null;
  // Prefer the natural forward path (first non-reverse entry)
  const forwardBias: Partial<Record<UniversalCreationState, UniversalCreationState>> =
    {
      idea: "discovery",
      discovery: "foundation",
      foundation: "planning",
      planning: "building",
      building: "review",
      review: "ready",
      ready: "executing",
      executing: "completed",
      completed: "growth",
      growth: "reuse",
      archive: "reuse",
      reuse: "planning",
    };
  return forwardBias[state] ?? options[0] ?? null;
}
