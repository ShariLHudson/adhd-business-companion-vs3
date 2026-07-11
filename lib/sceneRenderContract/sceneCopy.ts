/**
 * Scene Render Contract — single source of truth for visible workspace copy.
 */

import { CLEAR_MY_MIND_WORKSPACE_SUBTITLE } from "@/lib/clearMyMindCopy";
import { LIFE_EXPERIENCE_ROOM_TAGLINE } from "@/lib/lifeExperienceRoom";
import {
  PLANNING_TABLE_SUBTITLE,
  PLANNING_TABLE_TITLE,
} from "@/lib/planningTableRoom/types";
import {
  SUNROOM_SUBTITLE,
  SUNROOM_TITLE,
} from "@/lib/sunroomOverThePond/types";
import { focusFeelingById, type FocusFeelingId } from "@/lib/focusHub";
import type { SceneCopy, SceneWorkspaceId } from "./types";

const SCENE_COPY: Record<SceneWorkspaceId, SceneCopy> = {
  "clear-my-mind": {
    title: "Clear My Mind",
    subtitle: CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
  },
  "clear-my-mind-thoughts": {
    title: "My Thoughts",
    subtitle: "Held safely — organize when you're ready.",
  },
  "life-experience-room": {
    title: "Life Experience Room",
    subtitle: LIFE_EXPERIENCE_ROOM_TAGLINE,
  },
  "plan-my-day": {
    title: PLANNING_TABLE_TITLE,
    subtitle: PLANNING_TABLE_SUBTITLE,
  },
  "focus-hub": {
    title: SUNROOM_TITLE,
    subtitle: SUNROOM_SUBTITLE,
  },
  "focus-category": {
    title: SUNROOM_TITLE,
    subtitle: "",
  },
  breathe: {
    title: "Breathe",
    subtitle: "Stay with your breath — the estate is quiet with you.",
  },
  "focus-audio": {
    title: "Peaceful Places",
    subtitle: "Take a gentle pause. Choose the place that feels right.",
  },
  default: {
    title: "",
    subtitle: "",
  },
};

export function resolveSceneCopy(
  workspaceId: SceneWorkspaceId,
  overrides?: Partial<SceneCopy>,
  focusCategoryId?: string,
): SceneCopy {
  if (workspaceId === "focus-category" && focusCategoryId) {
    const category = focusFeelingById(focusCategoryId as FocusFeelingId);
    if (category) {
      return {
        title: category.label,
        subtitle: category.tagline,
        ...overrides,
      };
    }
  }

  const base = SCENE_COPY[workspaceId] ?? SCENE_COPY.default;
  return { ...base, ...overrides };
}
