import { applyObjectLimits } from "@/lib/companionEnvironmentIntelligence/objectLimits";
import type {
  CompanionEnvironmentIntelligence,
  CompanionMotionKind,
  RoomObject,
  RoomObjectKind,
} from "@/lib/companionEnvironmentIntelligence/types";
import type { LivingChangeEngineInput, LivingChangeSet } from "./types";
import { enforceMotionIntegrity } from "./sceneIntegrityGate";
import {
  clearLivingRoomDeparture,
  recordLivingChangeApplication,
} from "./livingChangeHistory";

function mergeObjects(
  base: RoomObject[],
  changes: LivingChangeSet["changes"],
): RoomObject[] {
  const removeKinds = new Set<RoomObjectKind>();
  for (const change of changes) {
    for (const kind of change.removeObjectKinds ?? []) {
      removeKinds.add(kind);
    }
  }

  let objects = base.filter((object) => !removeKinds.has(object.kind));

  for (const change of changes) {
    if (!change.objects?.length) continue;
    for (const object of change.objects) {
      const exists = objects.some(
        (existing) =>
          existing.kind === object.kind &&
          existing.placement === object.placement,
      );
      if (!exists) objects.push(object);
    }
  }

  return applyObjectLimits(objects);
}

function mergeMotion(
  base: CompanionMotionKind[],
  changes: LivingChangeSet["changes"],
  input: LivingChangeEngineInput,
  heroMotion: CompanionMotionKind | null,
): CompanionMotionKind[] {
  let enabled = new Set(base);

  for (const change of changes) {
    for (const kind of change.motion?.disable ?? []) {
      enabled.delete(kind);
    }
    for (const kind of change.motion?.enable ?? []) {
      enabled.add(kind);
    }
  }

  if (heroMotion) {
    enabled = new Set([heroMotion, "candle", "foliage"].filter((kind) =>
      enabled.has(kind as CompanionMotionKind) || kind === heroMotion || kind === "candle",
    ) as CompanionMotionKind[]);
    if (!enabled.has(heroMotion)) {
      enabled.add(heroMotion);
    }
  }

  return enforceMotionIntegrity([...enabled], input);
}

export function applyLivingChangeSet(
  environment: CompanionEnvironmentIntelligence,
  changeSet: LivingChangeSet,
  input: LivingChangeEngineInput,
): CompanionEnvironmentIntelligence {
  const objects = mergeObjects(environment.objects, changeSet.changes);
  const motionEnabled = mergeMotion(
    environment.motion.enabled,
    changeSet.changes,
    input,
    changeSet.heroMotion,
  );

  if (input.livingLifeContext?.recordToHistory) {
    recordLivingChangeApplication({
      kinsey: changeSet.kinsey,
      wildlife: changeSet.wildlife,
      heroMotion: changeSet.heroMotion,
      hospitalityIds: changeSet.changes.map((c) => c.id),
      relationshipCue:
        changeSet.changes.find((c) => c.relationshipCue)?.relationshipCue ??
        null,
      conversationHints: changeSet.conversationHints,
      now: input.now,
    });
    if (input.livingLifeContext.visitKind === "arrival") {
      clearLivingRoomDeparture();
    }
  }

  return {
    ...environment,
    objects,
    motion: { enabled: motionEnabled },
    livingChangeSet: changeSet,
  };
}
