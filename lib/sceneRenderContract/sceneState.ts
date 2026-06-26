import type { ScenePage } from "@/lib/companionBackgrounds";
import type { SceneState, SceneWorkspaceId } from "./types";

export function createSceneState(input: {
  workspaceId: SceneWorkspaceId;
  seed?: string;
  scenePage?: ScenePage;
  focusCategoryId?: string;
  copyOverrides?: SceneState["copyOverrides"];
  now?: Date;
}): SceneState {
  return {
    workspaceId: input.workspaceId,
    seed: input.seed ?? input.workspaceId,
    scenePage: input.scenePage,
    focusCategoryId: input.focusCategoryId,
    copyOverrides: input.copyOverrides,
    now: input.now,
  };
}
