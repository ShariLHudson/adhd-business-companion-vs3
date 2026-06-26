/**
 * Scene Render Contract™ — single source of truth for visible workspace copy.
 */

import { CLEAR_MY_MIND_WORKSPACE_SUBTITLE } from "@/lib/clearMyMindCopy";
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
    subtitle:
      "Pick a pattern and length — energizing breaths stay under 1 minute to keep it safe and light.",
  },
  "focus-audio": {
    title: "Focus Audio",
    subtitle: "What does your brain need right now?",
    prompt:
      "Pick a sound below and I'll cue it up. It opens in a new tab so you can keep it playing alongside the Companion.",
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
