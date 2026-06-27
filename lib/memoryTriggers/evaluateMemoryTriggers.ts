import type { LivingChangeEngineInput, LivingChangeItem } from "@/lib/livingLifeEngine/types";
import { getLivingChangeHistory } from "@/lib/livingLifeEngine/livingChangeHistory";
import { MEMORY_TRIGGER_CATALOG } from "./catalog";
import {
  MEMORY_TRIGGER_FREQUENCY,
  isValidMemoryTriggerStoryLine,
} from "./rules";
import type { MemoryTriggerEntry, MemoryTriggersInput, MemoryTriggersVerdict } from "./types";
import {
  isMemoryTriggerVisitEligible,
  type CompanionRelationshipVerdict,
} from "@/lib/companionRelationship";

function stableHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function matchesSeason(
  entry: MemoryTriggerEntry,
  season: MemoryTriggersInput["season"],
): boolean {
  if (entry.seasons === "all") return true;
  const normalized = season === "holiday" ? "winter" : season;
  return entry.seasons.includes(normalized);
}

function matchesTime(
  entry: MemoryTriggerEntry,
  time: MemoryTriggersInput["timeOfDay"],
): boolean {
  if (entry.times === "all") return true;
  return entry.times.includes(time);
}

function matchesRelationship(
  entry: MemoryTriggerEntry,
  established: boolean,
): boolean {
  if (entry.relationshipSuitability === "any") return true;
  if (entry.relationshipSuitability === "established") return established;
  return !established;
}

export function isMemoryTriggerOnCooldown(
  triggerId: string,
  cooldownDays: number,
  now = new Date(),
): boolean {
  const history = getLivingChangeHistory();
  const value = `memory-trigger:${triggerId}`;
  const recent = history.records.find(
    (record) => record.kind === "observation" && record.value === value,
  );
  if (!recent) return false;
  const then = new Date(recent.at).getTime();
  return now.getTime() - then < cooldownDays * 24 * 60 * 60 * 1000;
}

function filterCandidates(input: MemoryTriggersInput): MemoryTriggerEntry[] {
  const now = input.now ?? new Date();
  const established = input.establishedRelationship ?? false;

  return MEMORY_TRIGGER_CATALOG.filter((entry) => {
    if (!matchesSeason(entry, input.season)) return false;
    if (!matchesTime(entry, input.timeOfDay)) return false;
    if (!matchesRelationship(entry, established)) return false;
    if (!isValidMemoryTriggerStoryLine(entry.storyLine)) return false;
    if (isMemoryTriggerOnCooldown(entry.id, entry.cooldownDays, now)) return false;
    return true;
  });
}

function suppressed(reason: string): MemoryTriggersVerdict {
  return {
    trigger: null,
    storyLine: null,
    cueCount: 0,
    suppressedReason: reason,
  };
}

/**
 * Select at most one Memory Trigger per eligible visit.
 * Many visits return none — silence is hospitality.
 */
export function evaluateMemoryTriggers(input: MemoryTriggersInput): MemoryTriggersVerdict {
  if (input.isFirstMeeting) return suppressed("first-meeting");
  if (input.recoveryGentle) return suppressed("recovery-gentle");
  if (input.flooded) return suppressed("flooded");
  if (input.grief) return suppressed("grief");

  const rhythm = input.companionRelationship?.rhythm;
  if (rhythm?.environmentalStorytelling === "minimal" && input.sessionVisitIndex % 3 !== 0) {
    return suppressed("relationship-minimal-storytelling");
  }

  const modulo =
    rhythm != null
      ? Math.max(2, rhythm.memoryTriggerVisitModulo)
      : MEMORY_TRIGGER_FREQUENCY.eligibleVisitModulo;
  if (input.sessionVisitIndex % modulo !== 0) {
    return suppressed("frequency-visit-modulo");
  }

  const candidates = filterCandidates(input);
  if (!candidates.length) return suppressed("no-eligible-candidates");

  const now = input.now ?? new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${dayKey}:${input.sessionVisitIndex}:memory-trigger`;
  const hash = stableHash(seed);
  const pick = candidates[hash % candidates.length]!;

  return {
    trigger: pick,
    storyLine: pick.storyLine,
    cueCount: 1,
    suppressedReason: null,
  };
}

export function memoryTriggerObservationValue(triggerId: string): string {
  return `memory-trigger:${triggerId}`;
}

function toLivingChangeItem(entry: MemoryTriggerEntry): LivingChangeItem {
  return {
    id: `memory-trigger-${entry.id}`,
    bucket: "relationship",
    priority: "relationship",
    sourceModule: "memoryTriggers",
    cause: `memory-awakened:${entry.sense}:${entry.name}`,
    conversationHint: entry.storyLine,
  };
}

/**
 * Wire Memory Triggers into the living change engine — one story line max.
 */
export function resolveMemoryTriggerChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  const verdict = evaluateMemoryTriggers({
    now: input.now,
    season: input.season,
    timeOfDay: input.timeOfDay,
    sessionVisitIndex: input.sessionVisitIndex,
    isFirstMeeting: input.isFirstMeeting,
    recoveryGentle: input.recoveryGentle || input.lowEnergy,
    flooded: input.livingLifeContext?.flooded,
    grief: input.livingLifeContext?.grief,
    establishedRelationship: (input.sessionVisitIndex ?? 0) >= 3,
    companionRelationship: input.companionRelationship ?? null,
  });

  if (!verdict.trigger || !verdict.storyLine) return [];
  return [toLivingChangeItem(verdict.trigger)];
}

export function filterValidMemoryTriggerHints(hints: string[]): string[] {
  return hints.filter((hint) => isValidMemoryTriggerStoryLine(hint));
}
