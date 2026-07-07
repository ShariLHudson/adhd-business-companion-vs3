"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { OCEAN_CONSERVATORY_VIDEO } from "@/lib/oceanConservatory/media";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { LivingBorderFrame } from "@/components/companion/LivingBorderFrame";
import {
  layoutScene,
  resolveScene,
  SCENE_BG_IMAGE_CLASS,
  SCENE_BG_MASK_CLASS,
  type SceneState,
  type SceneWorkspaceId,
} from "@/lib/sceneRenderContract";
import type { CinematicPresetId } from "@/lib/cinematicBackground";
import { hasRenderableSignatureObject } from "@/lib/sceneRenderContract/signatureObject";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  isOceanConservatoryBackground,
  isOceanConservatoryRoom,
} from "@/lib/oceanConservatory/isOceanConservatoryRoom";

type Props = {
  scene: SceneState;
  children: ReactNode;
  className?: string;
  banner?: ReactNode;
  /** Hide resolver-driven header when workspace renders its own */
  hideHeader?: boolean;
};

const CINEMATIC_PRESET_BY_WORKSPACE: Partial<
  Record<SceneWorkspaceId, CinematicPresetId>
> = {
  "clear-my-mind": "clear-my-mind",
  "clear-my-mind-thoughts": "clear-my-mind-thoughts",
  "plan-my-day": "plan-my-day",
  "life-experience-room": "life-evidence",
  "focus-hub": "focus-my-brain",
  "focus-category": "focus-my-brain",
  default: "default",
};

/**
 * SceneRenderer — mandatory pipeline terminus before workspace UI.
 * SceneState → SceneResolver → SceneLayoutEngine → SceneRenderer → UI
 */
export function SceneRenderer({
  scene,
  children,
  className = "",
  banner,
  hideHeader = false,
}: Props) {
  const resolved = resolveScene(scene);
  const layout = layoutScene(resolved);
  const { copy, background, motion } = resolved;
  const cinematicPreset =
    CINEMATIC_PRESET_BY_WORKSPACE[scene.workspaceId] ?? "default";

  const rootStyle = layout.cssVars as CSSProperties;

  useEffect(() => {
    if (background.mode !== "photo-scene" || !background.imageUrl) return;
    preloadRoomBackground(background.imageUrl);
  }, [background.imageUrl, background.mode]);

  const photoBgStyle: CSSProperties | undefined =
    background.mode === "photo-scene" && background.imageUrl && !background.videoUrl
      ? roomBackgroundImageStyle(background.imageUrl)
      : undefined;

  const isOceanConservatoryScene =
    background.mode === "photo-scene" &&
    (isOceanConservatoryRoom(resolved.environment.placeId) ||
      isOceanConservatoryBackground(background.imageUrl));

  const sceneVideoUrl =
    isOceanConservatoryScene
      ? OCEAN_CONSERVATORY_VIDEO
      : background.videoUrl;

  return (
    <div
      className={`${layout.rootClassName} ${className}`.trim()}
      style={rootStyle}
      {...layout.dataAttributes}
      data-scene-contract="1"
    >
      {/* Background layer — masked, dominance-capped; never in center zone */}
      {background.mode !== "none" ? (
        <div className={layout.backgroundClassName} aria-hidden="true">
          {background.mode === "photo-scene" && sceneVideoUrl ? (
            <CinematicBackground
              preset={cinematicPreset}
              mode="video"
              videoSrc={sceneVideoUrl}
              poster={background.imageUrl}
              placement="absolute"
              className="cinematic-background--scene-video"
              mediaClassName="companion-scene-fade"
              showBottomFade={!isOceanConservatoryScene}
            />
          ) : null}
          {background.mode === "photo-scene" &&
          background.imageUrl &&
          !sceneVideoUrl ? (
            <CinematicBackground
              preset={cinematicPreset}
              mode="image"
              imageStyle={photoBgStyle}
              placement="absolute"
              className="cinematic-background--scene-image"
              mediaClassName={`${SCENE_BG_IMAGE_CLASS} companion-scene-fade`}
            />
          ) : null}
          <div
            className="companion-scene-bg__wash"
            style={{ background: background.overlay }}
          />
          <div className={SCENE_BG_MASK_CLASS} />
        </div>
      ) : null}

      {/* Edge motion only — never inside center zone */}
      {motion.enabled && motion.placement === "edge-only" ? (
        <div className={layout.motionClassName}>
          <LivingBorderFrame
            placeId={resolved.environment.motionProfile.livingBorderPlaceId}
            workspaceId={scene.workspaceId}
            borderInput={resolved.environment.motionProfile.borderInput}
          />
        </div>
      ) : null}

      {/* Center UI layer — interaction only */}
      <div className={layout.centerZone.className}>
        {banner}

        {!hideHeader && copy.title ? (
          <header className={layout.headerClassName}>
            {hasRenderableSignatureObject(resolved) ? (
              <CompanionObjectVisual
                signatureId={resolved.signatureId}
                objectId={resolved.objectId}
                form="feature"
                size="card"
                animate
                className="companion-scene-header__object"
              />
            ) : null}
            <div className="companion-scene-header__copy">
              <h1 className="companion-scene-header__title">{copy.title}</h1>
              {copy.subtitle ? (
                <p className="companion-scene-header__subtitle">{copy.subtitle}</p>
              ) : null}
              {copy.prompt ? (
                <p className="companion-scene-header__prompt">{copy.prompt}</p>
              ) : null}
            </div>
          </header>
        ) : null}

        <div className={`${layout.panel.className} companion-glass-panel`}>{children}</div>
      </div>
    </div>
  );
}
