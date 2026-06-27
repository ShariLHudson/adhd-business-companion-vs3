/**
 * Live Ecosystem — reality changes once, judgment updates once, every workspace adapts.
 * Today's Reality is an input. Companion Brain is the source of truth.
 */

import { CompanionBrain } from "@/lib/companionBrain";
import { todayStr } from "@/lib/companionStore";
import { formatAdaptationMessage } from "./adaptationMessage";
import { detectMeaningfulShift } from "./detectMeaningfulShift";
import { emitLiveAdaptationSignals } from "./emitLiveAdaptationSignals";
import { gatherEcosystemMemory } from "./gatherEcosystemMemory";
import {
  COMPANION_REALITY_UPDATED,
  publishJudgmentUpdated,
  publishRealityUpdated,
  readLiveJudgment,
  writeLiveJudgment,
} from "./liveJudgmentStore";
import type { LiveAdaptationResult, RealitySignal } from "./types";

let listenersRegistered = false;

/**
 * Publish a reality signal — triggers immediate brain re-evaluation.
 */
export function publishRealitySignal(signal: RealitySignal): LiveAdaptationResult {
  return reEvaluateLiveJudgment(signal);
}

/**
 * Re-run Companion Brain from current ecosystem memory.
 */
export function reEvaluateLiveJudgment(
  signal: RealitySignal,
): LiveAdaptationResult {
  const dayKey = todayStr();
  const previous = readLiveJudgment();
  const memory = gatherEcosystemMemory(dayKey);
  const cycle = CompanionBrain.runReasoningCycle(memory);
  const meaningful = detectMeaningfulShift(
    previous?.cycle.judgment,
    cycle.judgment,
    signal,
  );
  const adaptationMessage = meaningful
    ? formatAdaptationMessage(
        cycle.judgment,
        signal,
        previous?.cycle.judgment,
      )
    : null;

  const snapshot = writeLiveJudgment({
    dayKey,
    evaluatedAt: new Date().toISOString(),
    cycle,
    lastSignal: signal,
    adaptationMessage,
    meaningfulShift: meaningful,
  });

  if (meaningful) {
    emitLiveAdaptationSignals({
      dayKey,
      signal,
      judgment: cycle.judgment,
      previousDayMode: previous?.cycle.judgment.dayMode ?? null,
    });
  }

  publishJudgmentUpdated(snapshot);

  return {
    snapshot,
    previousDayMode: previous?.cycle.judgment.dayMode ?? null,
  };
}

/**
 * Ensure judgment exists — bootstraps on first workspace open.
 */
export function ensureLiveJudgment(): LiveAdaptationResult {
  const existing = readLiveJudgment();
  const dayKey = todayStr();
  if (
    existing &&
    existing.dayKey === dayKey &&
    existing.cycle.judgment.morningPresence
  ) {
    return { snapshot: existing, previousDayMode: null };
  }
  return reEvaluateLiveJudgment({
    source: "future",
    kind: "generic",
    at: new Date().toISOString(),
  });
}

function onRealityUpdated(event: Event): void {
  const detail = (event as CustomEvent<RealitySignal>).detail;
  if (!detail?.at) return;
  reEvaluateLiveJudgment(detail);
}

/**
 * Register browser listeners once — import from companion layout.
 */
export function registerLiveEcosystemListeners(): void {
  if (listenersRegistered || typeof globalThis.window === "undefined") return;
  listenersRegistered = true;
  globalThis.window.addEventListener(COMPANION_REALITY_UPDATED, onRealityUpdated);
}
