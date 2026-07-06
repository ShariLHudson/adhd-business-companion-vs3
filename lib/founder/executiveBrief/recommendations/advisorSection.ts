import type { ExecutiveAdvisorRecommendation, IfIWereRunningSection } from "../types";

export const IF_I_WERE_RUNNING_HEADLINE =
  "If I were running Visual Spark Studios";

export const SAMPLE_ADVISOR_RECOMMENDATIONS: ExecutiveAdvisorRecommendation[] = [
  {
    id: "adv-continue-listening-rooms",
    title: "Continue Listening Rooms today",
    why: "It is the clearest member moment and unlocks marketing, nurture, and estate proof.",
    expectedImpact: "Stronger returns, calmer restarts, believable Gentle Restart campaign",
    difficulty: "medium",
    suggestedNextStep: "Review the estate scene against the Photograph Test.",
    missionId: "listening-rooms",
    missionRelationship: "Flagship mission — everything else waits politely behind it",
  },
  {
    id: "adv-decision-restart",
    title: "Confirm the restart investment decision",
    why: "Two paths are waiting in the vault; clarity prevents drift.",
    expectedImpact: "Faster team alignment and less context switching",
    difficulty: "low",
    suggestedNextStep: "Open Decision Vault item dec-invest-restart and decide.",
    missionId: "listening-rooms",
    missionRelationship: "Unlocks budget attention for estate scenes",
  },
  {
    id: "adv-workshop-fatigue",
    title: "Shape one Decision Fatigue workshop outline",
    why: "Member voice keeps asking for help choosing — revenue and care align here.",
    expectedImpact: "Workshop pipeline plus content for PostCraft",
    difficulty: "medium",
    suggestedNextStep: "Discuss outline in Strategy Center when Listening Rooms QA is done.",
    missionId: "workshop-series",
    missionRelationship: "Downstream of restart — members choose once they feel safe",
  },
];

export function buildIfIWereRunningSection(
  recommendations: ExecutiveAdvisorRecommendation[] = SAMPLE_ADVISOR_RECOMMENDATIONS,
): IfIWereRunningSection {
  return {
    headline: IF_I_WERE_RUNNING_HEADLINE,
    subhead: "Three moves I would make from your chair this week.",
    recommendations: recommendations.slice(0, 3),
  };
}

export function topAdvisorRecommendations(limit = 3): ExecutiveAdvisorRecommendation[] {
  return SAMPLE_ADVISOR_RECOMMENDATIONS.slice(0, limit);
}
