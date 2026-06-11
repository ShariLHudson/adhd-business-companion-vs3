"use client";

import {
  pickScene,
  SCENE_OVERLAY,
  type ScenePage,
} from "@/lib/companionBackgrounds";

/**
 * Organic photo backdrop for a panel. Renders the picked scene under a warm
 * wash so dark text and glass cards stay readable. Changing `seed` (e.g. the
 * audio mood) cross-fades to a new scene via the keyed image layer.
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
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[#f5f0e8]" />
      <div
        key={url}
        className="companion-scene-fade absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${url}')` }}
      />
      <div className="absolute inset-0" style={{ background: SCENE_OVERLAY }} />
    </div>
  );
}
