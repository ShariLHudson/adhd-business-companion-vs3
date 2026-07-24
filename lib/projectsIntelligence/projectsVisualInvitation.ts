/**
 * Calm Projects → Visual Thinking invitation projection (pilot).
 * Pure labels + a11y — Project Homes UI may render these without inventing map catalogs.
 */

import type { ProjectsVisualThinkingRecommendation } from "@/lib/projectsIntelligence/visualThinkingIntegration";

export type ProjectsVisualInvitationProjection = {
  visible: boolean;
  message: string;
  statusText: string;
  actions: Array<{
    id: "show_visually" | "keep_working" | "not_during_project";
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
export function projectProjectsVisualInvitation(
  recommendation: ProjectsVisualThinkingRecommendation,
): ProjectsVisualInvitationProjection {
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
      ariaLabel: "Visual project invitation",
    };
  }

  return {
    visible: true,
    message: recommendation.userFacingMessage,
    statusText:
      "Optional visual view available. You can keep working here or open a visual.",
    actions: [
      {
        id: "show_visually",
        label: recommendation.primaryActionLabel,
        primary: true,
      },
      {
        id: "keep_working",
        label: recommendation.keepActionLabel,
        primary: false,
      },
      {
        id: "not_during_project",
        label: recommendation.suppressActionLabel,
        primary: false,
      },
    ],
    role: "region",
    ariaLabel: "Optional visual project invitation",
  };
}
