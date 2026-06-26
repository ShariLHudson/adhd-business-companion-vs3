import type { CompanionEnvironmentIntelligence } from "@/lib/companionEnvironmentIntelligence/types";
import { resolveEnvironmentalTruth } from "./environmentalTruthResolver";
import type { EnvironmentalTruth, EnvironmentalTruthInput } from "./types";

export function applyEnvironmentalTruth(
  environment: CompanionEnvironmentIntelligence,
  input?: Partial<EnvironmentalTruthInput>,
): CompanionEnvironmentIntelligence {
  const truthInput: EnvironmentalTruthInput = {
    timeOfDay: input?.timeOfDay ?? environment.atmosphere.timeOfDay,
    season: input?.season ?? environment.atmosphere.season,
    weather: input?.weather ?? environment.atmosphere.weather,
    objects: input?.objects ?? environment.objects,
    motion: input?.motion ?? environment.motion.enabled,
    recoveryGentle: input?.recoveryGentle,
  };

  const resolved = resolveEnvironmentalTruth(truthInput);

  return {
    ...environment,
    objects: truthInput.objects,
    motion: { enabled: resolved.motion },
    environmentalTruth: {
      causes: resolved.causes,
      because: resolved.because,
      coherencePassed: resolved.coherencePassed,
      corrections: resolved.corrections,
    },
  };
}

export { resolveEnvironmentalTruth, resolveEnvironmentalCauses } from "./environmentalTruthResolver";
export {
  CAUSE_NARRATIVE,
  CAUSE_REQUIRED_MOTION,
  MOTION_CAUSE_MAP,
} from "./causeEffectLibrary";
export { ENVIRONMENTAL_TRUTH_RULE } from "./types";
export type { EnvironmentalCause, EnvironmentalTruth, EnvironmentalTruthInput } from "./types";
