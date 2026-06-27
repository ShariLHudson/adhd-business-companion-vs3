"use client";

import { useEffect, useState } from "react";
import {
  pickScene,
  SCENE_OVERLAY,
  type ScenePage,
} from "@/lib/companionBackgrounds";
import { SCENE_BG_IMAGE_CLASS } from "@/lib/sceneRenderContract";

type CompanionBackgroundProps = {
  // Which scene family to draw from — derived from what the user is talking
  // about (their emotional state / topic).
  page?: ScenePage;
  // A topic seed: changing it (new topic, new mood) swaps the scene organically.
  seed?: string;
  /** Quieter atmosphere for the calm home — Shari and conversation lead. */
  calmHome?: boolean;
  /** Clear My Mind — warmer room visible, less wash. */
  clearMyMind?: boolean;
  /** Constitutional scene owns the photo — keep only the warm gradient base. */
  suppress?: boolean;
};

export function CompanionBackground({
  page = "today",
  seed = "",
  calmHome = false,
  clearMyMind = false,
  suppress = false,
}: CompanionBackgroundProps) {
  // The current hour is only known on the client, so resolve the scene after
  // mount. Until then we show the warm gradient base (no layout shift, no
  // hydration mismatch).
  const [scene, setScene] = useState<string | null>(null);

  useEffect(() => {
    if (suppress) return;
    setScene(pickScene(page, seed));
    // Re-pick when the topic or scene family changes; also re-resolves the
    // hour so the image shifts across morning → night.
  }, [page, seed, suppress]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${calmHome ? "companion-background-calm" : ""}${clearMyMind ? " companion-background-clear-my-mind" : ""}`}
      aria-hidden="true"
      data-home-calm={calmHome ? "" : undefined}
      data-clear-my-mind={clearMyMind ? "" : undefined}
      data-background-suppressed={suppress ? "" : undefined}
    >
      {/* Warm gradient base — always present as a fallback. */}
      <div className="companion-bg-base absolute inset-0 bg-gradient-to-br from-[#f7f0e6] via-[#f2ebe2] to-[#ebe4da]" />

      {!suppress && scene && (
        <div
          className={`${SCENE_BG_IMAGE_CLASS} companion-bg-scene companion-scene-fade absolute inset-0 transition-opacity duration-700`}
          style={{
            backgroundImage: `url('${scene}')`,
            opacity: clearMyMind ? "var(--scene-image-dominance, 0.55)" : undefined,
          }}
        />
      )}

      {!suppress ? (
        <>
          {/* Warm wash so dark text + glass cards stay readable over any photo. */}
          <div
            className="companion-bg-wash absolute inset-0"
            style={{ background: SCENE_OVERLAY }}
          />

          {/* Subtle texture + vignette for depth. */}
          <div className="companion-noise absolute inset-0 opacity-[0.03]" />
          <div className="companion-bg-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(35,30,26,0.12)_100%)]" />
        </>
      ) : null}
    </div>
  );
}
