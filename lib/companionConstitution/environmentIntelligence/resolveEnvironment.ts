import { pickScene, SCENE_OVERLAY, type ScenePage } from "@/lib/companionBackgrounds";
import {
  CLEAR_MY_MIND_CONSERVATORY_BG,
  CLEAR_MY_MIND_WORKSPACE_MAX_WIDTH,
  CLEAR_MY_MIND_WORKSPACE_MIN_WIDTH,
} from "@/lib/clearMyMind/conservatory";
import {
  FOCUS_MY_BRAIN_ROOM_BG,
  FOCUS_MY_BRAIN_WORKSPACE_MAX_WIDTH,
  FOCUS_MY_BRAIN_WORKSPACE_MIN_WIDTH,
} from "@/lib/focusMyBrain/focusRoom";
import {
  PLAN_MY_DAY_MORNING_BG,
  PLAN_MY_DAY_WORKSPACE_MAX_WIDTH,
  PLAN_MY_DAY_WORKSPACE_MIN_WIDTH,
} from "@/lib/planMyDay/morningRoom";
import {
  LIFE_EXPERIENCE_LETTER_MAX_WIDTH,
  LIFE_EXPERIENCE_ROOM_BG,
} from "@/lib/lifeExperienceRoom";
import {
  PEACEFUL_PLACES_DIRECTORY_MAX_WIDTH,
  PEACEFUL_PLACES_DIRECTORY_MIN_WIDTH,
  PEACEFUL_PLACES_PATHWAY_BG,
} from "@/lib/peacefulPlaces/pathway";
import type { AppSection } from "@/lib/companionUi";
import { focusLandscapeSpace } from "@/lib/focusLandscape/spaceCatalog";
import { spaceForFocusWorkspace } from "@/lib/focusLandscape/toolRouting";
import { resolveHomesteadTime } from "@/lib/homesteadTime";
import { resolvePlanningTimeProfile } from "@/lib/planningTableRoom/layout";
import type { SceneWorkspaceId } from "@/lib/sceneRenderContract";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { createCompanionState } from "../companionState";
import { roomRegistryEntry } from "./roomRegistry";
import type {
  EnvironmentInput,
  EnvironmentState,
  SceneConditionId,
} from "./types";

const HOMESTEAD_WORKSPACES = new Set<SceneWorkspaceId>([
  "clear-my-mind",
  "clear-my-mind-thoughts",
  "life-experience-room",
  "plan-my-day",
  "focus-hub",
  "focus-category",
  "focus-audio",
]);

const HOMESTEAD_SCENE_PAGES: Partial<Record<SceneWorkspaceId, ScenePage>> = {
  "clear-my-mind": "recovery",
  "clear-my-mind-thoughts": "recovery",
  "life-experience-room": "recovery",
  "plan-my-day": "today",
  "focus-hub": "focus",
  "focus-category": "focus",
  "focus-audio": "recovery",
};

const PHOTO_SCENE_WORKSPACES: Record<string, ScenePage> = {
  breathe: "progress",
  "focus-audio": "focus",
};

const SIGNATURE_BY_WORKSPACE: Partial<
  Record<SceneWorkspaceId, { signatureId: string; objectId: string }>
> = {
  "plan-my-day": {
    signatureId: "sig-planning-notebook",
    objectId: "plan-my-day",
  },
  "focus-hub": {
    signatureId: "sig-pond-anchor",
    objectId: "focus-my-brain",
  },
  "focus-category": {
    signatureId: "sig-pond-anchor",
    objectId: "focus-my-brain",
  },
};

const SECTION_TO_SCENE: Partial<Record<AppSection, SceneWorkspaceId>> = {
  "brain-dump": "clear-my-mind",
  "life-experience": "life-experience-room",
  "plan-my-day": "plan-my-day",
  focus: "focus-hub",
  breathe: "breathe",
  "focus-audio": "focus-audio",
};

function resolveSceneWorkspaceId(
  input: EnvironmentInput,
): SceneWorkspaceId | undefined {
  if (input.workspaceId) {
    return input.workspaceId as SceneWorkspaceId;
  }
  if (input.section) {
    return SECTION_TO_SCENE[input.section];
  }
  return undefined;
}

function resolvePlaceForSection(section: AppSection): CompanionPlaceId {
  switch (section) {
    case "home":
    case "today":
      return "living-room";
    case "brain-dump":
      return "greenhouse";
    case "life-experience":
      return "reading-nook";
    case "plan-my-day":
      return "planning-table";
    case "focus":
      return "sunroom-over-pond";
    case "visual-focus":
      return "focus-studio";
    case "content-generator":
    case "my-work":
      return "creative-studio";
    case "projects":
    case "templates-library":
    case "snippets":
    case "saved-work":
      return "workshop";
    case "how-do-i":
      return "library";
    case "growth":
    case "my-journey":
      return "reading-nook";
    case "business-profile":
    case "decision-compass":
      return "business-office";
    case "energy":
      return "kitchen-table";
    case "breathe":
    case "focus-audio":
      return "reading-nook";
    default:
      return "living-room";
  }
}

function resolvePlaceId(input: EnvironmentInput): {
  placeId: CompanionPlaceId;
  focusLandscapeSpaceId?: string;
  planningTimeProfile?: string;
} {
  const workspaceId = resolveSceneWorkspaceId(input);

  if (
    workspaceId === "focus-hub" ||
    workspaceId === "focus-category" ||
    input.section === "focus"
  ) {
    const spaceId = spaceForFocusWorkspace({
      workspaceId,
      focusCategoryId: input.focusCategoryId,
      toolId: input.focusToolId,
    });
    const space = focusLandscapeSpace(spaceId);
    return {
      placeId: space.placeId,
      focusLandscapeSpaceId: spaceId,
    };
  }

  if (workspaceId === "plan-my-day" || input.section === "plan-my-day") {
    const homesteadTime = resolveHomesteadTime({
      now: input.now,
      placeId: "planning-table",
    });
    const timeProfile = resolvePlanningTimeProfile({
      timeOfDay: input.timeOfDay ?? homesteadTime.legacyTimeOfDay,
      weather: input.weather,
      season: input.season,
    });
    return {
      placeId: "planning-table",
      planningTimeProfile: timeProfile,
    };
  }

  if (workspaceId) {
    const base: Partial<Record<SceneWorkspaceId, CompanionPlaceId>> = {
      "clear-my-mind": "greenhouse",
      "clear-my-mind-thoughts": "greenhouse",
      "life-experience-room": "reading-nook",
      breathe: "reading-nook",
      "focus-audio": "reading-nook",
      default: "living-room",
    };
    return { placeId: base[workspaceId] ?? "living-room" };
  }

  if (input.section) {
    return { placeId: resolvePlaceForSection(input.section) };
  }

  return { placeId: "living-room" };
}

function sceneConditionForInput(input: EnvironmentInput): SceneConditionId {
  const homesteadTime = resolveHomesteadTime({ now: input.now });
  const timeOfDay = input.timeOfDay ?? homesteadTime.legacyTimeOfDay;

  if (input.weather === "rain") return "rain";
  if (input.weather === "snow") return "snow";
  if (input.season === "winter") return "winter";
  if (homesteadTime.period === "golden-hour") return "golden-hour";
  if (timeOfDay === "morning") return "morning";
  if (timeOfDay === "afternoon") return "afternoon";
  if (timeOfDay === "evening") return "evening";
  if (timeOfDay === "night") return "night";
  return "default";
}

function resolveBackground(
  workspaceId: SceneWorkspaceId | undefined,
  placeId: CompanionPlaceId,
  input: EnvironmentInput,
): EnvironmentState["background"] {
  const seed = input.seed ?? workspaceId ?? input.section ?? "living-room";
  const room = roomRegistryEntry(placeId);

  if (workspaceId && HOMESTEAD_WORKSPACES.has(workspaceId)) {
    if (
      workspaceId === "clear-my-mind" ||
      workspaceId === "clear-my-mind-thoughts"
    ) {
      return {
        mode: "photo-scene",
        imageUrl: CLEAR_MY_MIND_CONSERVATORY_BG,
        scenePage: "recovery",
        seed: "original-sunroom",
        overlay: "rgba(255, 248, 232, 0.05)",
        objectPosition: "center 42%",
        fit: "cover-safe-crop",
        dominanceCap: 1,
      };
    }

    if (workspaceId === "focus-audio") {
      return {
        mode: "photo-scene",
        imageUrl: PEACEFUL_PLACES_PATHWAY_BG,
        scenePage: "recovery",
        seed: "peaceful-places-pathway",
        overlay: "rgba(255, 252, 245, 0.04)",
        objectPosition: "center center",
        fit: "cover-safe-crop",
        dominanceCap: 1,
      };
    }

    if (workspaceId === "life-experience-room") {
      return {
        mode: "photo-scene",
        imageUrl: LIFE_EXPERIENCE_ROOM_BG,
        scenePage: "recovery",
        seed: "life-experience-library",
        overlay: "rgba(255, 248, 235, 0.05)",
        objectPosition: "center center",
        fit: "cover-safe-crop",
        dominanceCap: 0.96,
      };
    }

    if (workspaceId === "plan-my-day") {
      return {
        mode: "photo-scene",
        imageUrl: PLAN_MY_DAY_MORNING_BG,
        scenePage: "today",
        seed: "plan-my-day-morning",
        overlay: "rgba(255, 250, 242, 0.04)",
        objectPosition: "center center",
        fit: "cover-safe-crop",
        dominanceCap: 1,
      };
    }

    if (workspaceId === "focus-hub" || workspaceId === "focus-category") {
      return {
        mode: "photo-scene",
        imageUrl: FOCUS_MY_BRAIN_ROOM_BG,
        scenePage: "focus",
        seed: "focus-my-brain",
        overlay: "rgba(255, 250, 242, 0.04)",
        objectPosition: "center center",
        fit: "cover-safe-crop",
        dominanceCap: 1,
      };
    }

    const scenePage =
      input.scenePage ?? HOMESTEAD_SCENE_PAGES[workspaceId] ?? "today";
    const imageUrl = pickScene(scenePage, seed);
    const objectPosition = room.cameraCrop;
    const dominanceCap = 0.52;
    const overlay = "rgba(252, 246, 236, 0.22)";
    return {
      mode: "photo-scene",
      imageUrl,
      scenePage,
      seed,
      overlay,
      objectPosition,
      fit: "cover-safe-crop",
      dominanceCap,
    };
  }

  const scenePage =
    input.scenePage ??
    (workspaceId ? PHOTO_SCENE_WORKSPACES[workspaceId] : undefined) ??
    "focus";
  const imageUrl = pickScene(scenePage, seed);

  return {
    mode: "photo-scene",
    imageUrl,
    scenePage,
    seed,
    overlay: SCENE_OVERLAY,
    objectPosition: room.cameraCrop || "center 38%",
    fit: "cover-safe-crop",
    dominanceCap: 0.48,
  };
}

/**
 * Environment Intelligence — sole authority for room, place, scene, background,
 * motion profile, signature object, and camera crop.
 */
export function resolveEnvironment(
  input: EnvironmentInput = {},
): EnvironmentState {
  const companion = input.companion ?? createCompanionState();
  const now = input.now ?? new Date();
  const workspaceId = resolveSceneWorkspaceId(input);
  const { placeId, focusLandscapeSpaceId, planningTimeProfile } =
    resolvePlaceId(input);
  const room = roomRegistryEntry(placeId);
  const background = resolveBackground(workspaceId, placeId, input);
  const homestead = Boolean(
    workspaceId && HOMESTEAD_WORKSPACES.has(workspaceId),
  );
  const homesteadTime = resolveHomesteadTime({ now, placeId });

  const cssVars: Record<string, string> = {};
  const dataAttributes: Record<string, string> = {
    "data-environment-intelligence": "1",
    "data-homestead-place": placeId,
    "data-scene-condition": sceneConditionForInput(input),
  };

  if (focusLandscapeSpaceId) {
    dataAttributes["data-focus-landscape"] = "1";
    dataAttributes["data-focus-landscape-space"] = focusLandscapeSpaceId;
  }
  if (planningTimeProfile) {
    dataAttributes["data-planning-table-room"] = "1";
    dataAttributes["data-planning-time-profile"] = planningTimeProfile;
  }

  const signatureEntry =
    workspaceId && SIGNATURE_BY_WORKSPACE[workspaceId]
      ? SIGNATURE_BY_WORKSPACE[workspaceId]
      : undefined;
  const signature =
    signatureEntry?.signatureId && signatureEntry?.objectId
      ? {
          signatureId: signatureEntry.signatureId,
          objectId: signatureEntry.objectId,
        }
      : undefined;

  return {
    placeId,
    roomId: placeId,
    sceneCondition: sceneConditionForInput(input),
    workspaceId,
    section: input.section,
    background,
    lighting: room.defaultLighting,
    cameraCrop: {
      objectPosition: background.objectPosition,
      dominanceCap: background.dominanceCap,
    },
    workspaceSize:
      workspaceId === "clear-my-mind" || workspaceId === "clear-my-mind-thoughts"
        ? `clamp(${CLEAR_MY_MIND_WORKSPACE_MIN_WIDTH}, 92vw, ${CLEAR_MY_MIND_WORKSPACE_MAX_WIDTH})`
        : workspaceId === "focus-audio"
          ? `clamp(${PEACEFUL_PLACES_DIRECTORY_MIN_WIDTH}, 92vw, ${PEACEFUL_PLACES_DIRECTORY_MAX_WIDTH})`
        : workspaceId === "life-experience-room"
          ? `clamp(26.25rem, 92vw, ${LIFE_EXPERIENCE_LETTER_MAX_WIDTH})`
          : workspaceId === "focus-hub" || workspaceId === "focus-category"
            ? `clamp(${FOCUS_MY_BRAIN_WORKSPACE_MIN_WIDTH}, 92vw, ${FOCUS_MY_BRAIN_WORKSPACE_MAX_WIDTH})`
            : homestead
              ? "36rem"
              : "32rem",
    signatureObject: signature,
    motionProfile: {
      enabled:
        homestead &&
        workspaceId !== "clear-my-mind" &&
        workspaceId !== "clear-my-mind-thoughts" &&
        workspaceId !== "life-experience-room" &&
        workspaceId !== "focus-hub" &&
        workspaceId !== "focus-category" &&
        workspaceId !== "focus-audio",
      placement:
        workspaceId === "clear-my-mind" ||
        workspaceId === "clear-my-mind-thoughts" ||
        workspaceId === "life-experience-room" ||
        workspaceId === "focus-hub" ||
        workspaceId === "focus-category" ||
        workspaceId === "focus-audio"
          ? "none"
          : homestead
            ? "edge-only"
            : "none",
      livingBorderPlaceId: room.livingBorderProfile,
      borderInput: {
        placeId: room.livingBorderProfile,
        workspaceId,
        timeOfDay: input.timeOfDay ?? homesteadTime.legacyTimeOfDay,
        season: input.season,
        weather: input.weather,
        warmLamp: companion.energy === "low",
        showMugSteam: !companion.overwhelmed,
      },
    },
    focusLandscapeSpaceId,
    planningTimeProfile,
    ambientAudio: null,
    scentProfile: null,
    cssVars,
    dataAttributes,
  };
}

/** Constitutional alias — place answers flow through Environment Intelligence only. */
export function resolvePlace(input: EnvironmentInput = {}): CompanionPlaceId {
  return resolveEnvironment(input).placeId;
}
