/**
 * Scene Render Contract™ — every workspace is a scene, not a page.
 * Pipeline: SceneState → SceneResolver → SceneLayoutEngine → SceneRenderer → UI
 */

import type { ScenePage } from "@/lib/companionBackgrounds";
import type { CompanionState } from "@/lib/companionConstitution/companionState";
import type { EnvironmentState } from "@/lib/companionConstitution/environmentIntelligence/types";
import type { PresenceState } from "@/lib/companionConstitution/presenceIntelligence/types";

export const SCENE_WORKSPACE_IDS = [
  "clear-my-mind",
  "clear-my-mind-thoughts",
  "plan-my-day",
  "focus-hub",
  "focus-category",
  "breathe",
  "focus-audio",
  "default",
] as const;

export type SceneWorkspaceId = (typeof SCENE_WORKSPACE_IDS)[number];

export type SceneBackgroundMode = "homestead-room" | "photo-scene" | "none";

export type SceneImageFit = "cover-safe-crop" | "contain-padded";

export type SceneMotionPlacement = "edge-only" | "none";

/** Input state — what workspace is being shown. */
export type SceneState = {
  workspaceId: SceneWorkspaceId;
  /** Stable seed for background selection */
  seed?: string;
  /** Photo scene page when backgroundMode is photo-scene */
  scenePage?: ScenePage;
  /** Optional category id for focus-category workspace */
  focusCategoryId?: string;
  /** Override copy keys — prefer resolver defaults */
  copyOverrides?: Partial<SceneCopy>;
  now?: Date;
  /** Layer 1 — supplied or resolved by constitutional pipeline */
  companion?: CompanionState;
  /** Layer 2 — sole authority for room/place/background; render only below */
  environment?: EnvironmentState;
  /** Layer 3 — sole authority for presence; render only below */
  presence?: PresenceState;
};

export type SceneCopy = {
  title: string;
  subtitle?: string;
  /** Optional prompt below header */
  prompt?: string;
};

export type SceneBackgroundSpec = {
  mode: SceneBackgroundMode;
  imageUrl?: string;
  scenePage?: ScenePage;
  seed: string;
  overlay: string;
  objectPosition: string;
  fit: SceneImageFit;
  dominanceCap: number;
};

export type SceneMotionSpec = {
  placement: SceneMotionPlacement;
  room:
    | "clear-my-mind"
    | "planning-table"
    | "sunroom-over-pond"
    | "default";
  enabled: boolean;
};

export type SceneLogoSpec = {
  visible: boolean;
  /** Logo is page-global; scene only reserves safe zone */
  reserveZone: boolean;
};

export type ResolvedScene = {
  workspaceId: SceneWorkspaceId;
  focusCategoryId?: string;
  copy: SceneCopy;
  background: SceneBackgroundSpec;
  motion: SceneMotionSpec;
  logo: SceneLogoSpec;
  signatureId?: string;
  objectId?: string;
  environment: EnvironmentState;
  presence: PresenceState;
};

export type SceneCenterZoneSpec = {
  className: string;
  maxWidth: string;
  zIndex: number;
};

export type ScenePanelSpec = {
  className: string;
  frostedOpacity: number;
};

export type SceneLayout = {
  rootClassName: string;
  backgroundClassName: string;
  motionClassName: string;
  centerZone: SceneCenterZoneSpec;
  panel: ScenePanelSpec;
  headerClassName: string;
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export const SCENE_RENDER_CONTRACT_VERSION = "1.0" as const;
