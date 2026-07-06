import type { FounderObservation, FounderProfileLearnInput, FounderProfileObserveInput } from "../types";
import { founderProfileSampleRepository } from "../repositories/sample";

const runtimeObservations: FounderObservation[] = [];

function nextObservationId(): string {
  return `obs-runtime-${Date.now()}-${runtimeObservations.length}`;
}

function inferKind(input: FounderProfileObserveInput): FounderObservation["kind"] {
  if (input.kind) return input.kind;
  const text = `${input.event} ${input.context ?? ""}`.toLowerCase();
  if (text.includes("restart") || text.includes("audio")) return "restart_habit";
  if (text.includes("research")) return "research_habit";
  if (text.includes("writing") || text.includes("draft")) return "writing_habit";
  if (text.includes("plan") || text.includes("strategy")) return "planning_habit";
  if (text.includes("switch") || text.includes("interrupt")) return "context_switching";
  if (text.includes("delay") || text.includes("block")) return "friction_signal";
  return "workflow_preference";
}

export function mergedObservations(): FounderObservation[] {
  return [...founderProfileSampleRepository.observations(), ...runtimeObservations];
}

export function captureObservation(input: FounderProfileObserveInput): FounderObservation {
  const now = new Date().toISOString();
  const kind = inferKind(input);
  const observation: FounderObservation = {
    id: nextObservationId(),
    kind,
    context: input.context ?? "general",
    observation: input.event,
    evidenceCount: 1,
    confidence: 45,
    firstNoticedAt: now,
    lastNoticedAt: now,
    decayWeight: 1,
    source: input.source ?? "runtime",
    missionId: input.missionId,
    outcome: input.outcome,
  };
  runtimeObservations.push(observation);
  return observation;
}

export function reinforceObservation(existing: FounderObservation, input: FounderProfileLearnInput): FounderObservation {
  const now = new Date().toISOString();
  return {
    ...existing,
    observation: input.observation,
    context: input.context,
    evidenceCount: existing.evidenceCount + 1,
    confidence: Math.min(95, existing.confidence + 4),
    lastNoticedAt: now,
    decayWeight: Math.min(1, existing.decayWeight + 0.02),
    source: input.source ?? existing.source,
    missionId: input.missionId ?? existing.missionId,
    outcome: input.outcome ?? existing.outcome,
  };
}

export function findMatchingObservation(input: FounderProfileLearnInput): FounderObservation | null {
  const match = mergedObservations().find(
    (o) => o.kind === input.kind && o.context.toLowerCase() === input.context.toLowerCase(),
  );
  return match ?? null;
}

export function applyLearn(input: FounderProfileLearnInput): FounderObservation {
  const existing = findMatchingObservation(input);
  if (existing && runtimeObservations.some((o) => o.id === existing.id)) {
    const idx = runtimeObservations.findIndex((o) => o.id === existing.id);
    const updated = reinforceObservation(existing, input);
    runtimeObservations[idx] = updated;
    return updated;
  }
  if (existing) {
    return reinforceObservation(existing, input);
  }
  return captureObservation({
    event: input.observation,
    kind: input.kind,
    context: input.context,
    source: input.source,
    missionId: input.missionId,
    outcome: input.outcome,
  });
}

export function resetRuntimeObservations(): void {
  runtimeObservations.length = 0;
}
