"use client";

import type { CSSProperties } from "react";
import {
  pickScene,
  SCENE_OVERLAY,
  type ScenePage,
} from "@/lib/companionBackgrounds";
import {
  SCENE_BG_CLASS,
  SCENE_BG_IMAGE_CLASS,
  SCENE_BG_MASK_CLASS,
} from "@/lib/sceneRenderContract";

/**
 * Legacy background layer — uses SceneLayoutEngine CSS classes for dominance caps.
 * Prefer SceneRenderer for new workspaces.
 */
export function SceneBackground({
  page,
  seed,
  className = "",
}: {
  page: ScenePage;
  seed: string;
  className?: string;
}) {
  const url = pickScene(page, seed);
  return (
    <div
      aria-hidden="true"
      className={`${SCENE_BG_CLASS} pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={
        {
          "--scene-image-dominance": "0.48",
          "--scene-image-scale": "1",
          "--scene-image-position": "center 38%",
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[#f5f0e8]" />
      <div
        key={url}
        className={`${SCENE_BG_IMAGE_CLASS} companion-scene-fade`}
        style={{ backgroundImage: `url('${url}')` }}
      />
      <div
        className="companion-scene-bg__wash absolute inset-0"
        style={{ background: SCENE_OVERLAY }}
      />
      <div className={SCENE_BG_MASK_CLASS} />
    </div>
  );
}
