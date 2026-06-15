/**
 * Loop detection — requires repeated signals, never one message alone.
 */

import {
  buildCompanionResponse,
  confidenceFromSignals,
  LOOP_DESCRIPTIONS,
  LOOP_PURPOSES,
  severityForFrequency,
} from "./loopMessages";
import type {
  ActivationStateHint,
  CognitiveLoadLevelHint,
  LoopConfidence,
  LoopRelatedSignal,
  LoopSignalObservation,
  LoopSnapshot,
  LoopType,
} from "./types";

const MS_DAY = 86_400_000;
const LOOKBACK_DAYS = 7;
/** Minimum observations before a loop is surfaced. */
export const MIN_LOOP_OBSERVATIONS = 2;

export type LoopCandidate = {
  loopType: LoopType;
  frequency: number;
  distinctSignals: number;
  distinctDays: number;
  relatedSignals: LoopRelatedSignal[];
};

export function detectLoopCandidates(
  observations: LoopSignalObservation[],
  now = new Date(),
): LoopCandidate[] {
  const since = now.getTime() - LOOKBACK_DAYS * MS_DAY;
  const recent = observations.filter(
    (o) => new Date(o.at).getTime() >= since,
  );

  const byType = new Map<LoopType, LoopSignalObservation[]>();
  for (const obs of recent) {
    const list = byType.get(obs.loopType) ?? [];
    list.push(obs);
    byType.set(obs.loopType, list);
  }

  const candidates: LoopCandidate[] = [];
  for (const [loopType, list] of byType) {
    if (list.length < MIN_LOOP_OBSERVATIONS) continue;

    const signalMap = new Map<string, LoopRelatedSignal>();
    const days = new Set<string>();

    for (const obs of list) {
      days.add(obs.dayKey);
      const existing = signalMap.get(obs.signalId);
      if (existing) {
        existing.count += 1;
        if (obs.at > existing.lastSeen) existing.lastSeen = obs.at;
      } else {
        signalMap.set(obs.signalId, {
          id: obs.signalId,
          label: obs.signalLabel,
          count: 1,
          lastSeen: obs.at,
        });
      }
    }

    candidates.push({
      loopType,
      frequency: list.length,
      distinctSignals: signalMap.size,
      distinctDays: days.size,
      relatedSignals: [...signalMap.values()].sort((a, b) => b.count - a.count),
    });
  }

  return candidates.sort((a, b) => b.frequency - a.frequency);
}

export function pickPrimaryLoop(
  candidates: LoopCandidate[],
): LoopCandidate | null {
  return candidates[0] ?? null;
}

export function buildLoopSnapshot(
  candidate: LoopCandidate,
  now = new Date(),
  context: {
    cognitiveLoadLevel?: CognitiveLoadLevelHint | null;
    activationState?: ActivationStateHint | null;
  } = {},
): LoopSnapshot {
  const confidence: LoopConfidence = confidenceFromSignals(
    candidate.frequency,
    candidate.distinctSignals,
    candidate.distinctDays,
  );
  const dayKey = now.toISOString().slice(0, 10);
  const rotationKey = `${candidate.loopType}:${dayKey}`;

  return {
    loopType: candidate.loopType,
    confidence,
    frequency: candidate.frequency,
    severity: severityForFrequency(candidate.frequency),
    description: LOOP_DESCRIPTIONS[candidate.loopType],
    possiblePurpose: LOOP_PURPOSES[candidate.loopType],
    companionResponse: buildCompanionResponse(
      candidate.loopType,
      context.cognitiveLoadLevel,
      context.activationState,
      rotationKey,
    ),
    relatedSignals: candidate.relatedSignals.slice(0, 5),
    createdAt: now.toISOString(),
  };
}
