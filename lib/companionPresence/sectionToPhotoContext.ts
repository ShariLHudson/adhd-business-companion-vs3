import type { CompanionPhotoContext } from "@/lib/companionPhotoLibrary";
import type { AppSection } from "@/lib/companionUi";
import type { CompanionPresenceExpression } from "./types";

export type WorkspacePresenceMapping = {
  photoContext: CompanionPhotoContext;
  expression: CompanionPresenceExpression;
};

/** Workspace → emotional photograph preference (Companion Presence Library™). */
const WORKSPACE_PRESENCE: Partial<Record<AppSection, WorkspacePresenceMapping>> =
  {
    home: { photoContext: "welcome", expression: "warm_welcome" },
    today: { photoContext: "planning", expression: "planning_together" },
    "plan-my-day": { photoContext: "planning", expression: "planning_together" },
    "time-block": { photoContext: "planning", expression: "planning_together" },
    energy: { photoContext: "planning", expression: "planning_together" },
    "brain-dump": { photoContext: "reflection", expression: "listening" },
    breathe: { photoContext: "reflection", expression: "calm_reassurance" },
    playbook: { photoContext: "planning", expression: "planning_together" },
    "focus-timer": { photoContext: "planning", expression: "focused" },
    "focus-audio": { photoContext: "planning", expression: "focused" },
    focus: { photoContext: "planning", expression: "encouraging" },
    activities: { photoContext: "planning", expression: "encouraging" },
    "guided-exercises": {
      photoContext: "reflection",
      expression: "calm_reassurance",
    },
    progress: { photoContext: "celebration", expression: "celebrating" },
    growth: { photoContext: "celebration", expression: "celebrating" },
    "wins-this-week": {
      photoContext: "celebration",
      expression: "celebrating",
    },
    "visual-focus": { photoContext: "growth", expression: "thoughtful" },
    "content-generator": { photoContext: "teaching", expression: "teaching" },
    "how-do-i": { photoContext: "teaching", expression: "teaching" },
    "client-avatars": { photoContext: "teaching", expression: "curious" },
    projects: { photoContext: "planning", expression: "planning_together" },
    "decision-compass": {
      photoContext: "reflection",
      expression: "thoughtful",
    },
  };

export function workspacePresenceMapping(
  panel: AppSection | null | undefined,
): WorkspacePresenceMapping | null {
  if (!panel) return null;
  return WORKSPACE_PRESENCE[panel] ?? null;
}
