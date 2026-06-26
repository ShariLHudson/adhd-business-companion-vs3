/**
 * Live judgment store — single source of truth for current Companion Brain™ output.
 */

import type { LiveJudgmentSnapshot } from "./types";

export const COMPANION_JUDGMENT_UPDATED = "companion-judgment-updated";
export const COMPANION_REALITY_UPDATED = "companion-reality-updated";

let current: LiveJudgmentSnapshot | null = null;
let revision = 0;

export function readLiveJudgment(): LiveJudgmentSnapshot | null {
  return current;
}

export function writeLiveJudgment(
  input: Omit<LiveJudgmentSnapshot, "revision">,
): LiveJudgmentSnapshot {
  revision += 1;
  current = { ...input, revision };
  return current;
}

export function resetLiveJudgmentForTests(): void {
  current = null;
  revision = 0;
}

export function publishJudgmentUpdated(snapshot: LiveJudgmentSnapshot): void {
  if (typeof globalThis.window === "undefined") return;
  globalThis.window.dispatchEvent(
    new CustomEvent(COMPANION_JUDGMENT_UPDATED, { detail: snapshot }),
  );
}

export function publishRealityUpdated(
  detail: import("./types").RealitySignal,
): void {
  if (typeof globalThis.window === "undefined") return;
  globalThis.window.dispatchEvent(
    new CustomEvent(COMPANION_REALITY_UPDATED, { detail }),
  );
}
