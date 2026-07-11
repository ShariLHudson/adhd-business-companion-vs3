/**
 * SceneLayoutEngine — renders constitutional environment + presence.
 * Does not decide room, place, background, or Shari presence.
 */

import {
  cinematicFramingToCssVars,
  resolveCinematicPreset,
  type CinematicPresetId,
} from "@/lib/cinematicBackground";
import type { ResolvedScene, SceneLayout, SceneWorkspaceId } from "./types";
import {
  evaluateRoomComposition,
  LIVING_FRAME_CLASS,
} from "@/lib/roomCompositionRule";
import { evaluatePlanningTableRoom } from "@/lib/planningTableRoom";
import { evaluateFocusLandscape } from "@/lib/focusLandscape";

export const SCENE_ROOT_CLASS = "companion-scene-root";
export const SCENE_BG_CLASS = "companion-scene-bg";
export const SCENE_BG_IMAGE_CLASS = "companion-scene-bg__image";
export const SCENE_BG_MASK_CLASS = "companion-scene-bg__mask";
export const SCENE_MOTION_CLASS = "companion-scene-motion";
export const SCENE_CENTER_CLASS = "companion-scene-center";
export const SCENE_PANEL_CLASS = "companion-scene-panel";
export const SCENE_HEADER_CLASS = "companion-scene-header";

const CINEMATIC_PRESET_BY_WORKSPACE: Partial<
  Record<SceneWorkspaceId, CinematicPresetId>
> = {
  "clear-my-mind": "clear-my-mind",
  "clear-my-mind-thoughts": "clear-my-mind-thoughts",
  "plan-my-day": "plan-my-day",
  "visual-focus": "default",
  "life-experience-room": "life-evidence",
  "focus-hub": "focus-my-brain",
  "focus-category": "focus-my-brain",
  default: "home",
};

const FROSTED_BY_MODE: Record<ResolvedScene["background"]["mode"], number> = {
  "homestead-room": 0.52,
  "photo-scene": 0.58,
  none: 0.72,
};

/**
 * Layout a resolved scene — CSS originates here; decisions come from above.
 */
export function layoutScene(resolved: ResolvedScene): SceneLayout {
  const { background, motion, environment, presence } = resolved;

  const planningTable =
    resolved.workspaceId === "plan-my-day"
      ? evaluatePlanningTableRoom()
      : null;
  const focusLandscape =
    resolved.workspaceId === "focus-hub" ||
    resolved.workspaceId === "focus-category"
      ? evaluateFocusLandscape({
          workspaceId: resolved.workspaceId,
          focusCategoryId: resolved.focusCategoryId,
        })
      : null;

  const composition = evaluateRoomComposition({
    workspaceId: resolved.workspaceId,
    placeId: environment.placeId,
  });

  const dominance = Math.min(1, Math.max(0.2, background.dominanceCap));
  const frostedOpacity =
    composition.panelFrostedOpacity ?? FROSTED_BY_MODE[background.mode];

  const cinematicBase = resolveCinematicPreset(
    CINEMATIC_PRESET_BY_WORKSPACE[resolved.workspaceId] ?? "default",
  );
  const imagePosition =
    composition.backgroundObjectPosition ??
    background.objectPosition ??
    cinematicBase.position;

  const cssVars: Record<string, string> = {
    ...cinematicFramingToCssVars({
      ...cinematicBase,
      position: imagePosition,
    }),
    "--scene-image-dominance": String(dominance),
    "--scene-overlay": background.overlay,
    "--scene-panel-frosted-opacity": String(frostedOpacity),
    "--scene-center-max-width":
      composition.protectedConversationZone.maxWidth ??
      environment.workspaceSize,
    "--scene-logo-reserve": resolved.logo.reserveZone ? "4.75rem" : "0px",
    ...composition.cssVars,
    ...environment.cssVars,
    ...(planningTable?.cssVars ?? {}),
    ...(focusLandscape?.cssVars ?? {}),
  };

  const rootModifiers = [
    `companion-scene-root--${resolved.workspaceId}`,
    `companion-scene-root--room-${composition.placeId}`,
    `companion-scene-root--signature-${composition.signatureFeature.visibleZone}`,
    LIVING_FRAME_CLASS,
    `companion-scene-root--bg-${background.mode}`,
    background.fit === "contain-padded"
      ? "companion-scene-root--fit-contain"
      : "companion-scene-root--fit-cover-safe",
    motion.enabled ? "companion-scene-root--motion-edge" : "companion-scene-root--motion-none",
    planningTable ? "companion-scene-root--planning-table" : "",
    environment.planningTimeProfile
      ? `companion-scene-root--planning-${environment.planningTimeProfile}`
      : "",
    environment.focusLandscapeSpaceId ? "companion-scene-root--focus-landscape" : "",
    environment.focusLandscapeSpaceId
      ? `companion-scene-root--focus-${environment.focusLandscapeSpaceId}`
      : "",
  ].filter(Boolean);

  const planningDataAttributes = planningTable
    ? Object.fromEntries(
        Object.entries(planningTable.dataAttributes).filter(
          ([key]) => key !== "data-sharis-presence" && key !== "data-homestead-place",
        ),
      )
    : {};

  const focusDataAttributes = focusLandscape
    ? Object.fromEntries(
        Object.entries(focusLandscape.dataAttributes).filter(
          ([key]) =>
            key !== "data-sharis-presence" &&
            key !== "data-homestead-place" &&
            key !== "data-focus-landscape-space",
        ),
      )
    : {};

  return {
    rootClassName: [SCENE_ROOT_CLASS, ...rootModifiers].join(" "),
    backgroundClassName: SCENE_BG_CLASS,
    motionClassName: SCENE_MOTION_CLASS,
    centerZone: {
      className: SCENE_CENTER_CLASS,
      maxWidth: "var(--scene-center-max-width)",
      zIndex: 10,
    },
    panel: {
      className: SCENE_PANEL_CLASS,
      frostedOpacity,
    },
    headerClassName: SCENE_HEADER_CLASS,
    cssVars,
    dataAttributes: {
      "data-scene-workspace": resolved.workspaceId,
      "data-scene-bg-mode": background.mode,
      "data-scene-motion": motion.placement,
      ...composition.dataAttributes,
      ...environment.dataAttributes,
      ...presence.dataAttributes,
      ...planningDataAttributes,
      ...focusDataAttributes,
    },
  };
}

/** Center zone must never host environmental motion — hard validation. */
export function centerZoneAllowsMotion(): false {
  return false;
}

/** Image dominance cap — backgrounds never exceed container visually. */
export function clampImageDominance(value: number): number {
  return Math.min(0.62, Math.max(0.25, value));
}
