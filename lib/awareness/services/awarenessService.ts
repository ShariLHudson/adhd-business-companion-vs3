import type { AwarenessContext, AwarenessView } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { AWARENESS_PRINCIPLE } from "../sample";
import { awarenessSampleRepository } from "../repositories/sample";
import { collectAwarenessSignals } from "../signals/signalCollector";
import { observeSignals } from "../observers/domainObservers";
import { detectChanges } from "../detectors/changeDetector";
import { detectPatterns, compareToBaseline } from "../comparisons/trendComparison";
import { detectExceptions, findRelationships } from "../relationships/relationshipFinder";
import {
  surfaceOpportunities,
  surfaceRecommendations,
  surfaceRisks,
} from "../detectors/significanceFilter";
import { applyRuleOfThree } from "@/lib/calmIntelligence";

export function composeAwareness(context: AwarenessContext = {}): AwarenessView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  const signals = collectAwarenessSignals(missionId);
  const observations = observeSignals(signals);
  const changes = detectChanges(signals);
  const patterns = detectPatterns(signals, changes);
  const relationships = findRelationships(observations);
  const exceptions = detectExceptions(changes, observations);
  const opportunities = applyRuleOfThree(surfaceOpportunities(observations, changes));
  const risks = applyRuleOfThree(surfaceRisks(observations, changes));
  const { recommendations, backgroundCount } = surfaceRecommendations(observations, changes);

  void compareToBaseline(signals, awarenessSampleRepository.priorSignals());

  return {
    product: "founder",
    missionId,
    generatedAt: new Date().toISOString(),
    principle: AWARENESS_PRINCIPLE,
    signals,
    observations,
    changes,
    patterns,
    exceptions,
    opportunities: opportunities.items,
    risks: risks.items,
    relationships,
    recommendations,
    backgroundCount: backgroundCount + opportunities.hiddenCount + risks.hiddenCount,
  };
}

export function significantAwareness(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  const view = composeAwareness({ missionId });
  return view.recommendations;
}

export class AwarenessService {
  compose(context: AwarenessContext = {}) {
    return composeAwareness(context);
  }

  significant(missionId?: MissionId) {
    return significantAwareness(missionId);
  }

  sampleRepository() {
    return awarenessSampleRepository;
  }
}

export const awarenessService = new AwarenessService();
