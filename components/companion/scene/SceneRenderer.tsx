"use client";

import type { CSSProperties, ReactNode } from "react";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { LivingBorderFrame } from "@/components/companion/LivingBorderFrame";
import {
  layoutScene,
  resolveScene,
  SCENE_BG_IMAGE_CLASS,
  SCENE_BG_MASK_CLASS,
  type SceneState,
} from "@/lib/sceneRenderContract";
import { hasRenderableSignatureObject } from "@/lib/sceneRenderContract/signatureObject";

type Props = {
  scene: SceneState;
  children: ReactNode;
  className?: string;
  banner?: ReactNode;
  /** Hide resolver-driven header when workspace renders its own */
  hideHeader?: boolean;
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

  const rootStyle = layout.cssVars as CSSProperties;

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
          {background.mode === "photo-scene" && background.imageUrl ? (
            <div
              key={background.imageUrl}
              className={`${SCENE_BG_IMAGE_CLASS} companion-scene-fade`}
              style={{
                backgroundImage: `url('${background.imageUrl}')`,
              }}
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

        <div className={layout.panel.className}>{children}</div>
      </div>
    </div>
  );
}
