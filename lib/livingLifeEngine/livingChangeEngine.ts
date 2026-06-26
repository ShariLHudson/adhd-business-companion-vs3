import type { CompanionEnvironmentInput } from "@/lib/companionEnvironmentIntelligence/types";
import type { CompanionEnvironmentIntelligence } from "@/lib/companionEnvironmentIntelligence/types";
import { evaluateCompanionRelationship } from "@/lib/companionRelationship";
import { applyLivingChangeSet } from "./applyLivingChangeSet";
import { resolveLivingChangeSet } from "./livingChangeResolver";
import type { LivingChangeEngineInput, LivingChangeSet } from "./types";

export function buildLivingChangeEngineInput(input: {
  environment: CompanionEnvironmentIntelligence;
  companionInput: CompanionEnvironmentInput;
}): LivingChangeEngineInput {
  return {
    now: input.companionInput.now,
    timeOfDay: input.companionInput.timeOfDay,
    season: input.companionInput.season,
    weather: input.environment.atmosphere.weather,
    sessionVisitIndex: input.companionInput.sessionVisitIndex,
    isFirstMeeting: input.companionInput.isFirstMeeting,
    recoveryGentle: input.companionInput.recoveryGentle,
    lowEnergy: input.companionInput.lowEnergy,
    birthdayToday: input.companionInput.birthdayToday,
    vacationDaysAway: input.companionInput.vacationDaysAway,
    projectRecentlyCompleted: input.companionInput.projectRecentlyCompleted,
    objects: input.environment.objects,
    motion: input.environment.motion,
    livingLifeContext: input.companionInput.livingLifeContext,
    homesteadPeriod: input.companionInput.homesteadTime?.period,
    companionRelationship:
      input.companionInput.companionRelationship ??
      evaluateCompanionRelationship({
        sessionVisitIndex: input.companionInput.sessionVisitIndex,
        userText: input.companionInput.arrivalUserText ?? null,
        overwhelmed: input.companionInput.livingLifeContext?.flooded,
      }),
  };
}

/**
 * Living Change Engine™ — produces a validated Living Change Set™.
 * Never renders UI; integrates with Scene Integrity before composition.
 */
export function resolveAndApplyLivingChanges(input: {
  environment: CompanionEnvironmentIntelligence;
  companionInput: CompanionEnvironmentInput;
}): {
  environment: CompanionEnvironmentIntelligence;
  changeSet: LivingChangeSet;
} {
  const engineInput = buildLivingChangeEngineInput(input);
  const changeSet = resolveLivingChangeSet(engineInput);
  const environment = applyLivingChangeSet(
    input.environment,
    changeSet,
    engineInput,
  );
  return { environment, changeSet };
}

export { resolveLivingChangeSet } from "./livingChangeResolver";
export { applyLivingChangeSet } from "./applyLivingChangeSet";
export { recordLivingRoomDeparture, minutesSinceLivingRoomDeparture } from "./livingChangeHistory";
export type {
  LivingChangeSet,
  LivingChangeItem,
  LivingLifeContext,
  KinseyPose,
  WildlifeSpecies,
  LivingVisitKind,
} from "./types";
