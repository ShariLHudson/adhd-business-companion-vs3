import { resolveCompanionRenderContext } from "@/lib/companionConstitution";
import { resolveSceneCopy } from "./sceneCopy";
import type {
  ResolvedScene,
  SceneBackgroundSpec,
  SceneMotionSpec,
  SceneState,
} from "./types";

function backgroundFromEnvironment(
  environment: ResolvedScene["environment"],
): SceneBackgroundSpec {
  return { ...environment.background };
}

function motionFromEnvironment(
  environment: ResolvedScene["environment"],
): SceneMotionSpec {
  const { motionProfile, workspaceId } = environment;
  return {
    placement: motionProfile.placement,
    room:
      workspaceId?.startsWith("clear-my-mind")
        ? "clear-my-mind"
        : workspaceId === "plan-my-day"
          ? "planning-table"
          : workspaceId === "visual-focus"
            ? "focus-studio"
          : workspaceId === "focus-hub" || workspaceId === "focus-category"
            ? "sunroom-over-pond"
            : "default",
    enabled: motionProfile.enabled,
  };
}

/**
 * SceneResolver — renders constitutional decisions; never decides room/place/presence.
 */
export function resolveScene(state: SceneState): ResolvedScene {
  const context = resolveCompanionRenderContext({
    scene: state,
    environment: state.environment
      ? undefined
      : {
          workspaceId: state.workspaceId,
          focusCategoryId: state.focusCategoryId,
          seed: state.seed,
          scenePage: state.scenePage,
          now: state.now,
          companion: state.companion,
        },
    companion: state.companion,
  });

  const { environment, presence } = context;
  const copy = resolveSceneCopy(
    state.workspaceId,
    state.copyOverrides,
    state.focusCategoryId,
  );

  return {
    workspaceId: state.workspaceId,
    focusCategoryId: state.focusCategoryId,
    copy,
    background: backgroundFromEnvironment(environment),
    motion: motionFromEnvironment(environment),
    logo: {
      visible: false,
      reserveZone: true,
    },
    signatureId: environment.signatureObject?.signatureId,
    objectId: environment.signatureObject?.objectId,
    environment,
    presence,
  };
}
