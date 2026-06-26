import type { LivingChangeEngineInput, LivingChangeItem } from "@/lib/livingLifeEngine/types";
import { isOnCooldown } from "@/lib/livingLifeEngine/livingChangeHistory";
import { isEverydayLifeVisitEligible } from "@/lib/companionRelationship";
import { EVERYDAY_LIFE_CATALOG, type EverydayMoment } from "./catalog";
import { violatesEverydayLifeNarration } from "./rules";

function stableHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function matchesSeason(moment: EverydayMoment, season: LivingChangeEngineInput["season"]): boolean {
  if (!moment.seasons?.length) return true;
  const normalized = season === "holiday" ? "winter" : season;
  return moment.seasons.includes(normalized);
}

function matchesTime(moment: EverydayMoment, time: LivingChangeEngineInput["timeOfDay"]): boolean {
  if (!moment.times?.length) return true;
  return moment.times.includes(time);
}

function filterCandidates(input: LivingChangeEngineInput): EverydayMoment[] {
  return EVERYDAY_LIFE_CATALOG.filter((moment) => {
    if (!matchesSeason(moment, input.season)) return false;
    if (!matchesTime(moment, input.timeOfDay)) return false;
    const now = input.now ?? new Date();
    if (isOnCooldown("hospitality", `everyday-${moment.id}`, now)) return false;
    return true;
  });
}

function toLivingChangeItem(moment: EverydayMoment): LivingChangeItem {
  return {
    id: `everyday-${moment.id}`,
    bucket: "environmental",
    priority: "life_continuity",
    sourceModule: "sharisEverydayLife",
    cause: moment.cause,
    objects: moment.objects,
    kinsey: moment.kinsey,
    wildlife: moment.wildlife,
  };
}

/**
 * One quiet lived-in detail per eligible visit — noticed, never announced.
 */
export function resolveEverydayLifeChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  if (input.isFirstMeeting) return [];
  if (input.recoveryGentle || input.lowEnergy) return [];
  if (input.livingLifeContext?.flooded || input.livingLifeContext?.grief) return [];

  const rhythm = input.companionRelationship?.rhythm;
  if (
    rhythm &&
    !isEverydayLifeVisitEligible(rhythm, input.sessionVisitIndex)
  ) {
    return [];
  }

  const candidates = filterCandidates(input);
  if (!candidates.length) return [];

  const now = input.now ?? new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${dayKey}:${input.sessionVisitIndex}:everyday`;
  const hash = stableHash(seed);
  const pick = candidates[hash % candidates.length]!;

  if (input.sessionVisitIndex % 2 === 0 && !pick.imperfect) {
    return [];
  }

  return [toLivingChangeItem(pick)];
}

export function filterSilentConversationHints(hints: string[]): string[] {
  return hints.filter((hint) => !violatesEverydayLifeNarration(hint));
}
