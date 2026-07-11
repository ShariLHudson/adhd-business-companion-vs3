"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import {
  estateRoomExperienceVideoPlaybackRate,
  estateRoomUsesExperienceVideo,
  estateRoomUsesOceanConservatoryVideo,
  resolveEstateRoomExperienceVideo,
} from "@/lib/estate/estateRoomExperienceVideo";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { LivingBorderFrame } from "@/components/companion/LivingBorderFrame";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
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

type Props = {
  scene: SceneState;
  children: ReactNode;
  className?: string;
  banner?: ReactNode;
  /** Hide resolver-driven header when workspace renders its own */
  hideHeader?: boolean;
  /**
   * Immersive estate session — no frosted glass panel.
   * Background stays fully visible; children float over the room.
   */
  immersive?: boolean;
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
  immersive = false,
}: Props) {
  const backdropRevision = useChatBackdropRevision();
  const resolved = resolveScene(scene);
  const layout = layoutScene(resolved);
  void backdropRevision;
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
    estateRoomUsesOceanConservatoryVideo(resolved.environment.placeId);

  const manifestVideo =
    background.mode === "photo-scene"
      ? resolveEstateRoomExperienceVideo(
          resolved.environment.placeId,
          background.imageUrl,
        )
      : null;

  const sceneVideoUrl = manifestVideo ?? background.videoUrl;
  const sceneVideoCarriesAudio = Boolean(
    sceneVideoUrl &&
      estateRoomUsesExperienceVideo(
        resolved.environment.placeId,
        background.imageUrl,
      ),
  );

  const keepEstateFullyVisible =
    immersive ||
    scene.workspaceId === "breathe" ||
    scene.workspaceId === "clear-my-mind" ||
    scene.workspaceId === "clear-my-mind-thoughts";

  return (
    <div
      className={`${layout.rootClassName} ${className}`.trim()}
      style={rootStyle}
      {...layout.dataAttributes}
      data-scene-contract="1"
      data-scene-immersive={immersive ? "1" : undefined}
    >
      {/* Background layer — masked, dominance-capped; never in center zone */}
      {background.mode !== "none" ? (
        <div className={layout.backgroundClassName} aria-hidden="true">
          {background.mode === "photo-scene" && sceneVideoUrl ? (
            <CinematicBackground
              preset={
                isOceanConservatoryScene ? "ocean-conservatory" : cinematicPreset
              }
              mode="video"
              videoSrc={sceneVideoUrl}
              poster={background.imageUrl}
              muted={!sceneVideoCarriesAudio}
              playbackRate={
                sceneVideoUrl
                  ? estateRoomExperienceVideoPlaybackRate(
                      resolved.environment.placeId,
                    )
                  : undefined
              }
              placement="absolute"
              className={[
                "cinematic-background--scene-video",
                isOceanConservatoryScene
                  ? "cinematic-background--ocean-conservatory"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              mediaClassName={
                keepEstateFullyVisible ? undefined : "companion-scene-fade"
              }
              showBottomFade={!isOceanConservatoryScene && !immersive}
            />
          ) : null}
          {background.mode === "photo-scene" &&
          background.imageUrl &&
          !sceneVideoUrl ? (
            <CinematicBackground
              key={`scene-photo-${background.imageUrl}-${backdropRevision}`}
              preset={cinematicPreset}
              mode="image"
              imageStyle={photoBgStyle}
              placement="absolute"
              className="cinematic-background--scene-image"
              mediaClassName={`${SCENE_BG_IMAGE_CLASS}${
                keepEstateFullyVisible ? "" : " companion-scene-fade"
              }`}
              showBottomFade={!keepEstateFullyVisible}
            />
          ) : null}
          {!immersive ? (
            <div
              className="companion-scene-bg__wash"
              style={{ background: background.overlay }}
            />
          ) : null}
          {!immersive ? <div className={SCENE_BG_MASK_CLASS} /> : null}
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

        {immersive ? (
          <div
            className="companion-scene-immersive-layer"
            data-scene-immersive="1"
          >
            {children}
          </div>
        ) : (
          <div className={`${layout.panel.className} companion-glass-panel`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
