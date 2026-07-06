import type { AttentionState, RecommendationState, RoutedRecommendation } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeExecutiveDesk } from "@/lib/founder/commandCenter";
import { improvementService } from "@/lib/improvement";
import { founderProfileService } from "@/lib/founderProfile";
import { opportunityDiscoveryService } from "@/lib/opportunities";
import { ONE_RECOMMENDATION_PRINCIPLE } from "../sample";

function candidate(
  id: string,
  title: string,
  summary: string,
  source: string,
  leverageScore: number,
): RoutedRecommendation {
  return { id, title, summary, source, leverageScore, tier: "library" };
}

export function collectCompetingRecommendations(missionId: MissionId): RoutedRecommendation[] {
  const items: RoutedRecommendation[] = [];
  const desk = composeExecutiveDesk(missionId);

  if (desk.recommendedDecision) {
    items.push(
      candidate(
        `rec-decision-${desk.recommendedDecision.id}`,
        desk.recommendedDecision.headline,
        desk.recommendedDecision.why,
        "executive_decision",
        95,
      ),
    );
  }

  items.push(
    candidate(
      `rec-next-${desk.recommendedNextAction.id}`,
      desk.recommendedNextAction.label,
      desk.recommendedNextAction.reason,
      "command_center",
      88,
    ),
  );

  for (const opp of desk.topOpportunities) {
    items.push(candidate(`rec-opp-${opp.id}`, opp.title, opp.summary, "opportunity_discovery", 75));
  }

  const improvement = improvementService.topImprovement(missionId);
  if (improvement) {
    items.push(
      candidate(
        `rec-improve-${improvement.id}`,
        improvement.title,
        improvement.summary,
        "continuous_improvement",
        improvement.roi.score,
      ),
    );
  }

  const profileRecs = founderProfileService.recommend({ missionId });
  const profileRec = profileRecs[0];
  if (profileRec) {
    const title = profileRec.suggestion.slice(0, 60);
    items.push(
      candidate(`rec-profile`, title, profileRec.suggestion, "founder_profile", profileRec.confidence),
    );
  }

  for (const opp of opportunityDiscoveryService.discover({ missionId }).slice(0, 5)) {
    if (!items.some((i) => i.id === `rec-opp-${opp.id}`)) {
      items.push(
        candidate(
          `rec-opp-${opp.id}`,
          opp.title,
          opp.reasoning?.whyItMatters ?? opp.summary,
          "opportunity_discovery",
          65,
        ),
      );
    }
  }

  return items.sort((a, b) => b.leverageScore - a.leverageScore);
}

export function routeAttention(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): AttentionState {
  const competing = collectCompetingRecommendations(missionId);
  const primary = competing[0] ? { ...competing[0], tier: "primary" as const } : null;
  const supporting = competing.slice(1, 4).map((r) => ({ ...r, tier: "supporting" as const }));
  const library = competing.slice(4).map((r) => ({ ...r, tier: "library" as const }));

  return {
    primary,
    supporting,
    library,
    deferredCount: library.length,
    principle: ONE_RECOMMENDATION_PRINCIPLE,
  };
}

export function composeAttention(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): AttentionState {
  return routeAttention(missionId);
}

export function toRecommendationState(attention: AttentionState): RecommendationState {
  return {
    primary: attention.primary,
    supporting: attention.supporting,
    libraryCount: attention.library.length,
    competingFiltered: attention.deferredCount,
  };
}
