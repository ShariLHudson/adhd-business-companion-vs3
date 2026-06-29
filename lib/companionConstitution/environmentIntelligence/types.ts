import type { ScenePage } from "@/lib/companionBackgrounds";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { AppSection } from "@/lib/companionUi";
import type { SceneWorkspaceId } from "@/lib/sceneRenderContract";
import type { LivingBorderInput } from "@/lib/livingBorder";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type { CompanionState } from "../companionState";

/** Scene = environmental condition (not workspace, not place). */
export type SceneConditionId =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "golden-hour"
  | "rain"
  | "snow"
  | "winter"
  | "after-rain"
  | "default";

export type EnvironmentBackgroundMode = "homestead-room" | "photo-scene" | "none";

export type EnvironmentBackgroundSpec = {
  mode: EnvironmentBackgroundMode;
  imageUrl?: string;
  videoUrl?: string;
  scenePage?: ScenePage;
  seed: string;
  overlay: string;
  objectPosition: string;
  fit: "cover-safe-crop" | "contain-padded";
  dominanceCap: number;
};

export type EnvironmentMotionProfile = {
  enabled: boolean;
  placement: "edge-only" | "none";
  livingBorderPlaceId: CompanionPlaceId;
  borderInput: LivingBorderInput;
};

export type EnvironmentSignatureObject = {
  signatureId: string;
  objectId: string;
};

/** Layer 2 output — the sole authority for where the guest exists. */
export type EnvironmentState = {
  placeId: CompanionPlaceId;
  roomId: CompanionPlaceId;
  sceneCondition: SceneConditionId;
  workspaceId?: SceneWorkspaceId;
  section?: AppSection;
  background: EnvironmentBackgroundSpec;
  lighting: string;
  cameraCrop: {
    objectPosition: string;
    dominanceCap: number;
  };
  workspaceSize: string;
  signatureObject?: EnvironmentSignatureObject;
  motionProfile: EnvironmentMotionProfile;
  focusLandscapeSpaceId?: string;
  planningTimeProfile?: string;
  ambientAudio: null;
  scentProfile: null;
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export type EnvironmentInput = {
  workspaceId?: string;
  section?: AppSection;
  focusCategoryId?: string;
  focusToolId?: string;
  companion?: CompanionState;
  now?: Date;
  timeOfDay?: WelcomeTimeOfDay;
  weather?: WelcomeWeather;
  season?: WelcomeSeason;
  seed?: string;
  scenePage?: ScenePage;
};
