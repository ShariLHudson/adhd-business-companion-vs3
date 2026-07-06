import type {
  AwarenessChange,
  AwarenessObservation,
  AwarenessOpportunity,
  AwarenessOutputChannel,
  AwarenessRecommendation,
  AwarenessRisk,
} from "../types";
import { applyRuleOfThree } from "@/lib/calmIntelligence";

const PRIORITY_SCORE: Record<AwarenessOutputChannel, number> = {
  founder_alert: 100,
  executive_brief: 85,
  mission_recommendation: 75,
  opportunity_recommendation: 70,
  background: 0,
};

function channelForObservation(obs: AwarenessObservation, change?: AwarenessChange): AwarenessOutputChannel {
  if (obs.domain === "customer_behavior" && obs.confidence.score >= 70) return "founder_alert";
  if (obs.shouldAct && obs.confidence.score >= 75) return "executive_brief";
  if (obs.domain === "mission_movement" && change?.kind === "growing") return "mission_recommendation";
  if (obs.domain === "growing_opportunity") return "opportunity_recommendation";
  if (obs.shouldWatch || obs.confidence.score < 60) return "background";
  return "executive_brief";
}

export function surfaceOpportunities(
  observations: AwarenessObservation[],
  changes: AwarenessChange[],
): AwarenessOpportunity[] {
  return observations
    .filter((o) =>
      ["growing_opportunity", "learning_opportunity", "product_momentum", "marketing_momentum"].includes(
        o.domain,
      ),
    )
    .map((obs) => {
      const change = changes.find((c) => c.signalId === obs.signalId);
      return {
        id: `opp-${obs.id}`,
        title: obs.title,
        summary: obs.summary,
        changeKind: change?.kind ?? "emerging",
        confidence: obs.confidence,
      };
    })
    .slice(0, 6);
}

export function surfaceRisks(
  observations: AwarenessObservation[],
  changes: AwarenessChange[],
): AwarenessRisk[] {
  return observations
    .filter((o) =>
      ["operational_bottleneck", "repeated_problem", "founder_behavior"].includes(o.domain) &&
      o.shouldAct,
    )
    .map((obs) => {
      const change = changes.find((c) => c.signalId === obs.signalId);
      return {
        id: `risk-${obs.id}`,
        title: obs.title,
        summary: obs.summary,
        changeKind: change?.kind ?? "declining",
        confidence: obs.confidence,
      };
    })
    .slice(0, 6);
}

export function surfaceRecommendations(
  observations: AwarenessObservation[],
  changes: AwarenessChange[],
): { recommendations: AwarenessRecommendation[]; backgroundCount: number } {
  const candidates = observations
    .map((obs) => {
      const change = changes.find((c) => c.signalId === obs.signalId);
      const channel = channelForObservation(obs, change);
      return {
        id: `rec-${obs.id}`,
        title: obs.title,
        summary: obs.whyItMatters,
        channel,
        observationId: obs.id,
        confidence: obs.confidence,
        significant: channel !== "background",
        score: PRIORITY_SCORE[channel] + obs.confidence.score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const significant = candidates.filter((c) => c.significant);
  const backgroundCount = candidates.length - significant.length;
  const capped = applyRuleOfThree(
    significant.map(({ score: _score, significant: _sig, ...rec }) => ({
      ...rec,
      significant: true as const,
      id: rec.id,
    })),
  );

  return {
    recommendations: capped.items,
    backgroundCount: backgroundCount + capped.hiddenCount,
  };
}
