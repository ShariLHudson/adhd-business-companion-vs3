import type { HospitalityResponse } from "@/lib/arrivalExperience";
import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";
import {
  LIVING_CHANGE_BUCKET_LIMITS,
  LIVING_CHANGE_PRIORITY_ORDER,
  type KinseyPose,
  type LivingChangeEngineInput,
  type LivingChangeItem,
  type LivingChangeSet,
  type WildlifeSpecies,
} from "./types";
import { LIVING_CHANGE_COMMUNICATION_RULE } from "@/lib/companionCommunicationAnchor";
import { resolveHospitalityPreparationChanges } from "./hospitalityPreparationResolver";
import { resolveKinseyChanges } from "./kinseyResolver";
import { resolveWildlifeChanges } from "./wildlifeResolver";
import { resolveGardenChanges } from "./gardenResolver";
import { resolveRelationshipContinuityChanges } from "./relationshipContinuityResolver";
import {
  filterSilentConversationHints,
  resolveEverydayLifeChanges,
} from "@/lib/sharisEverydayLife";
import {
  filterValidMemoryTriggerHints,
  resolveMemoryTriggerChanges,
} from "@/lib/memoryTriggers";
import { resolveLivingTimeline } from "./livingTimelineResolver";
import { filterBySceneIntegrity } from "./sceneIntegrityGate";
import { filterLivingChangesToBorder } from "@/lib/livingBorder";
import { isOnCooldown } from "./livingChangeHistory";

function priorityRank(priority: LivingChangeItem["priority"]): number {
  const index = LIVING_CHANGE_PRIORITY_ORDER.indexOf(priority);
  return index === -1 ? LIVING_CHANGE_PRIORITY_ORDER.length : index;
}

function collectCandidates(input: LivingChangeEngineInput): LivingChangeItem[] {
  const safety: LivingChangeItem[] = [];

  if (input.livingLifeContext?.flooded || input.livingLifeContext?.grief) {
    safety.push({
      id: "safety-soften-room",
      bucket: "hospitality_preparation",
      priority: "safety",
      sourceModule: "livingChangeResolver",
      cause: "emotional-safety",
      hospitality: {
        showBlanket: true,
        warmLamp: true,
        closeCurtains: true,
        showMugSteam: false,
      },
    });
  }

  const timeChanges: LivingChangeItem[] = [];
  if (input.timeOfDay === "morning") {
    timeChanges.push({
      id: "time-morning-light",
      bucket: "environmental",
      priority: "time",
      sourceModule: "livingChangeResolver",
      cause: "morning-light",
      motion: { enable: ["sunlight"] },
      heroMotion: "sunlight",
    });
  }
  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    timeChanges.push({
      id: "time-evening-lamp",
      bucket: "environmental",
      priority: "time",
      sourceModule: "livingChangeResolver",
      cause: "evening-lamplight",
      motion: { enable: ["lamplight"] },
      heroMotion: "lamplight",
    });
  }

  const weatherChanges: LivingChangeItem[] = [];
  if (input.weather === "rain") {
    weatherChanges.push({
      id: "weather-rain",
      bucket: "environmental",
      priority: "weather",
      sourceModule: "livingChangeResolver",
      cause: "rain-beginning",
      motion: { enable: ["rain"], disable: ["sunlight"] },
      heroMotion: "rain",
    });
  }
  if (input.weather === "snow") {
    weatherChanges.push({
      id: "weather-snow",
      bucket: "environmental",
      priority: "weather",
      sourceModule: "livingChangeResolver",
      cause: "snow-outside",
      motion: { enable: ["snow"] },
      heroMotion: "snow",
    });
  }
  if (input.weather === "cloudy") {
    weatherChanges.push({
      id: "weather-cloud-soft",
      bucket: "environmental",
      priority: "weather",
      sourceModule: "livingChangeResolver",
      cause: "clouds-rolling",
      motion: { enable: ["curtains"] },
    });
  }

  return [
    ...safety,
    ...resolveHospitalityPreparationChanges(input),
    ...resolveRelationshipContinuityChanges(input),
    ...timeChanges,
    ...weatherChanges,
    ...resolveGardenChanges(input),
    ...resolveWildlifeChanges(input),
    ...resolveKinseyChanges(input),
    ...resolveEverydayLifeChanges(input),
    ...resolveMemoryTriggerChanges(input),
  ];
}

function applyBucketCaps(changes: LivingChangeItem[]): LivingChangeItem[] {
  const counts: Record<string, number> = {};
  const kept: LivingChangeItem[] = [];

  const sorted = [...changes].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
  );

  for (const change of sorted) {
    const limit = LIVING_CHANGE_BUCKET_LIMITS[change.bucket];
    const count = counts[change.bucket] ?? 0;
    if (count >= limit) continue;
    counts[change.bucket] = count + 1;
    kept.push(change);
  }

  return kept;
}

function filterAntiRepetition(
  changes: LivingChangeItem[],
  now: Date,
): LivingChangeItem[] {
  return changes.filter((change) => {
    if (change.heroMotion && isOnCooldown("hero_motion", change.heroMotion, now)) {
      return false;
    }
    if (change.conversationHint && isOnCooldown("observation", change.conversationHint, now)) {
      return false;
    }
    if (change.id && isOnCooldown("hospitality", change.id, now)) {
      return false;
    }
    return true;
  });
}

function mergeHospitality(
  changes: LivingChangeItem[],
): HospitalityResponse {
  const base: HospitalityResponse = {
    showBlanket: false,
    showMugSteam: false,
    warmLamp: false,
    closeCurtains: false,
  };

  for (const change of changes) {
    if (!change.hospitality) continue;
    if (change.hospitality.showBlanket) base.showBlanket = true;
    if (change.hospitality.showMugSteam) base.showMugSteam = true;
    if (change.hospitality.warmLamp) base.warmLamp = true;
    if (change.hospitality.closeCurtains) base.closeCurtains = true;
    if (change.hospitality.showMugSteam === false) base.showMugSteam = false;
  }

  return base;
}

function resolveHeroMotion(
  changes: LivingChangeItem[],
): CompanionMotionKind | null {
  const heroChanges = changes.filter((c) => c.heroMotion);
  if (heroChanges.length === 0) return null;
  const sorted = [...heroChanges].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
  );
  return sorted[0].heroMotion ?? null;
}

function resolveKinseyFromChanges(changes: LivingChangeItem[]): KinseyPose {
  const kinseyChange = changes.find((c) => c.kinsey);
  return kinseyChange?.kinsey ?? "hidden";
}

function resolveWildlifeFromChanges(
  changes: LivingChangeItem[],
): WildlifeSpecies | null {
  const wildlifeChange = changes.find((c) => c.wildlife);
  return wildlifeChange?.wildlife ?? null;
}

export function resolveLivingChangeSet(
  input: LivingChangeEngineInput,
): LivingChangeSet {
  const now = input.now ?? new Date();
  const timeline = resolveLivingTimeline({
    now,
    hoursSinceLastVisit: input.livingLifeContext?.hoursSinceLastVisit ?? null,
    visitKindHint: input.livingLifeContext?.visitKind,
    returnFromRoom: input.livingLifeContext?.returnFromRoom ?? null,
  });

  const engineInput: LivingChangeEngineInput = {
    ...input,
    livingLifeContext: {
      ...input.livingLifeContext,
      visitKind: timeline.visitKind,
    },
  };

  let candidates = collectCandidates(engineInput);

  if (input.isFirstMeeting) {
    candidates = candidates.filter(
      (change) =>
        change.priority === "safety" ||
        change.priority === "hospitality" ||
        change.priority === "time" ||
        change.sourceModule === "hospitalityPreparationResolver",
    );
  }

  candidates = filterBySceneIntegrity(candidates, engineInput);
  candidates = filterLivingChangesToBorder(candidates);
  candidates = filterAntiRepetition(candidates, now);

  const shouldRestrain =
    timeline.visitKind === "quiet_refresh" &&
    (timeline.elapsedSinceLastPresenceMs ?? 0) < 20 * 60 * 1000;

  const changes = shouldRestrain ? [] : applyBucketCaps(candidates);

  if (process.env.NODE_ENV !== "production" && changes.some((c) => c.cause.includes("block-input"))) {
    throw new Error(LIVING_CHANGE_COMMUNICATION_RULE);
  }

  return {
    changes,
    visitKind: timeline.visitKind,
    elapsedSinceLastPresenceMs: timeline.elapsedSinceLastPresenceMs,
    kinsey: resolveKinseyFromChanges(changes),
    wildlife: resolveWildlifeFromChanges(changes),
    heroMotion: resolveHeroMotion(changes),
    hospitality: mergeHospitality(changes),
    conversationHints: filterValidMemoryTriggerHints(
      filterSilentConversationHints(
        changes
          .map((c) => c.conversationHint)
          .filter((hint): hint is string => Boolean(hint)),
      ),
    ),
    appliedAt: now.toISOString(),
    restraintApplied: shouldRestrain && changes.length === 0,
  };
}
