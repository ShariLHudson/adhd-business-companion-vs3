/**
 * Calm Learning → Visual Thinking invitation projection (pilot).
 * Pure labels + a11y — Chamber UI may render these without inventing map catalogs.
 */

import type { LearningVisualThinkingRecommendation } from "@/lib/learningIntelligence/visualThinkingIntegration";

export type LearningVisualInvitationProjection = {
  visible: boolean;
  message: string;
  statusText: string;
  actions: Array<{
    id: "show_visually" | "keep_learning" | "not_during_lesson";
    label: string;
    primary: boolean;
  }>;
  role: "region";
  ariaLabel: string;
};

/**
 * Project recommendation into a compact, accessible invitation.
 * Explicit visual requests return visible:false (no second card).
 */
export function projectLearningVisualInvitation(
  recommendation: LearningVisualThinkingRecommendation,
): LearningVisualInvitationProjection {
  if (
    !recommendation.recommended ||
    recommendation.recommendationTiming === "explicit_request" ||
    !recommendation.userFacingMessage
  ) {
    return {
      visible: false,
      message: "",
      statusText: "",
      actions: [],
      role: "region",
      ariaLabel: "Visual learning invitation",
    };
  }

  return {
    visible: true,
    message: recommendation.userFacingMessage,
    statusText:
      "Optional visual view available. You can keep learning here or open a visual.",
    actions: [
      {
        id: "show_visually",
        label: recommendation.primaryActionLabel,
        primary: true,
      },
      {
        id: "keep_learning",
        label: recommendation.keepActionLabel,
        primary: false,
      },
      {
        id: "not_during_lesson",
        label: recommendation.suppressActionLabel,
        primary: false,
      },
    ],
    role: "region",
    ariaLabel: "Optional visual learning invitation",
  };
}
