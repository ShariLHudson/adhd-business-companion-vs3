"use client";

import { useEffect, useState } from "react";
import {
  pickScene,
  SCENE_OVERLAY,
  type ScenePage,
} from "@/lib/companionBackgrounds";

type CompanionBackgroundProps = {
  // Which scene family to draw from — derived from what the user is talking
  // about (their emotional state / topic).
  page?: ScenePage;
  // A topic seed: changing it (new topic, new mood) swaps the scene organically.
  seed?: string;
};

export function CompanionBackground({
  page = "today",
  seed = "",
}: CompanionBackgroundProps) {
  // The current hour is only known on the client, so resolve the scene after
  // mount. Until then we show the warm gradient base (no layout shift, no
  // hydration mismatch).
  const [scene, setScene] = useState<string | null>(null);

  useEffect(() => {
    setScene(pickScene(page, seed));
    // Re-pick when the topic or scene family changes; also re-resolves the
    // hour so the image shifts across morning → night.
  }, [page, seed]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Warm gradient base — always present as a fallback. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f7f0e6] via-[#f2ebe2] to-[#ebe4da]" />

      {/* Organic scene, cross-faded in once resolved. */}
      {scene && (
        <div
          className="absolute inset-0 scale-[1.03] bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url('${scene}')` }}
        />
      )}

      {/* Warm wash so dark text + glass cards stay readable over any photo. */}
      <div className="absolute inset-0" style={{ background: SCENE_OVERLAY }} />

      {/* Subtle texture + vignette for depth. */}
      <div className="companion-noise absolute inset-0 opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(35,30,26,0.12)_100%)]" />
    </div>
  );
}
