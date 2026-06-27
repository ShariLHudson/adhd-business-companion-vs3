/**
 * Companion Brain persisted judgment state.
 */

import type { CompanionBrainState, CooldownKind, JudgmentProfile } from "./types";

const STORE_KEY = "companion-brain-state-v1";
const BRAIN_VERSION = 1;

const JUDGMENT_PATCH_BOUND = 0.05;

function defaultProfile(): JudgmentProfile {
  return {
    weights: {},
    evidenceCount: 0,
    lastAdjustedAt: new Date(0).toISOString(),
  };
}

export function createDefaultCompanionBrainState(
  dayKey: string,
): CompanionBrainState {
  const now = new Date().toISOString();
  return {
    version: BRAIN_VERSION,
    lastReflectedDayKey: dayKey,
    updatedAt: now,
    timingJudgment: defaultProfile(),
    priorityJudgment: defaultProfile(),
    permissionJudgment: defaultProfile(),
    momentumJudgment: defaultProfile(),
    confidenceJudgment: defaultProfile(),
    relationshipJudgment: defaultProfile(),
    calibration: {
      predictionAccuracyEwma: 0.5,
      momentumSuccessEwma: 0.5,
      permissionAccuracyEwma: 0.5,
    },
    activeCooldowns: {},
  };
}

export function readCompanionBrainState(dayKey: string): CompanionBrainState {
  if (typeof window === "undefined") {
    return createDefaultCompanionBrainState(dayKey);
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return createDefaultCompanionBrainState(dayKey);
    const parsed = JSON.parse(raw) as CompanionBrainState;
    return { ...createDefaultCompanionBrainState(dayKey), ...parsed };
  } catch {
    return createDefaultCompanionBrainState(dayKey);
  }
}

export function writeCompanionBrainState(state: CompanionBrainState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* storage full */
  }
}

export function setCooldown(
  state: CompanionBrainState,
  kind: CooldownKind,
  dayKey: string,
): CompanionBrainState {
  return {
    ...state,
    activeCooldowns: { ...(state.activeCooldowns ?? {}), [kind]: dayKey },
    updatedAt: new Date().toISOString(),
  };
}

export function isCooldownActive(
  state: CompanionBrainState,
  kind: CooldownKind,
  currentDayKey: string,
): boolean {
  const setOn = state.activeCooldowns?.[kind];
  if (!setOn) return false;
  return setOn === currentDayKey || daysBetween(setOn, currentDayKey) <= 1;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.abs(Math.round((db - da) / 86_400_000));
}

export function applyBoundedPatch(
  profile: JudgmentProfile,
  path: string,
  delta: number,
): JudgmentProfile {
  const bounded = Math.max(
    -JUDGMENT_PATCH_BOUND,
    Math.min(JUDGMENT_PATCH_BOUND, delta),
  );
  const current = profile.weights[path] ?? 0;
  return {
    weights: { ...profile.weights, [path]: current + bounded },
    evidenceCount: profile.evidenceCount + 1,
    lastAdjustedAt: new Date().toISOString(),
  };
}

export { JUDGMENT_PATCH_BOUND, STORE_KEY };
