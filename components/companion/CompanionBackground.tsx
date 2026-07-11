"use client";

import { useEffect, useState } from "react";
import {
  pickScene,
  SCENE_OVERLAY,
  type ScenePage,
} from "@/lib/companionBackgrounds";
import {
  getClearMyMindBackdropImageUrl,
  useChatBackdropRevision,
} from "@/lib/chatBackdrop";
import { SCENE_BG_IMAGE_CLASS } from "@/lib/sceneRenderContract";
import { HomesteadChatScene } from "./HomesteadChatScene";

type CompanionBackgroundProps = {
  // Which scene family to draw from — derived from what the user is talking
  // about (their emotional state / topic).
  page?: ScenePage;
  // A topic seed: changing it (new topic, new mood) swaps the scene organically.
  seed?: string;
  /** Quieter atmosphere for the calm home — Shari and conversation lead. */
  calmHome?: boolean;
  /** Clear My Mind — Sunroom (or member-chosen) photograph behind the workspace. */
  clearMyMind?: boolean;
  /** Everyday chat — fixed living-room homestead, soft ambient only. */
  homesteadChat?: boolean;
  /** Constitutional scene owns the photo — keep only the warm gradient base. */
  suppress?: boolean;
};

export function CompanionBackground({
  page = "today",
  seed = "",
  calmHome = false,
  clearMyMind = false,
  homesteadChat = false,
  suppress = false,
}: CompanionBackgroundProps) {
  // The current hour is only known on the client, so resolve the scene after
  // mount. Until then we show the warm gradient base (no layout shift, no
  // hydration mismatch).
  const [scene, setScene] = useState<string | null>(null);
  const backdropRevision = useChatBackdropRevision();
  const clearMyMindImage = clearMyMind
    ? getClearMyMindBackdropImageUrl()
    : null;
  void backdropRevision;

  useEffect(() => {
    if (suppress || homesteadChat || clearMyMind) return;
    setScene(pickScene(page, seed));
    // Re-pick when the topic or scene family changes; also re-resolves the
    // hour so the image shifts across morning → night.
  }, [page, seed, suppress, homesteadChat, clearMyMind]);

  if (homesteadChat && !suppress && !clearMyMind) {
    return (
      <div
        className="companion-background-homestead-chat pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
        data-homestead-chat=""
      >
        <div className="companion-bg-base absolute inset-0 bg-gradient-to-br from-[#f7f0e6] via-[#f2ebe2] to-[#ebe4da]" />
        <HomesteadChatScene />
      </div>
    );
  }

  const photoUrl =
    clearMyMind && suppress
      ? null
      : clearMyMind
        ? clearMyMindImage
        : !suppress
          ? scene
          : null;
  /** When SceneRenderer owns Clear My Mind, keep only a quiet gradient under the panel. */
  const showAtmosphere = Boolean(
    (clearMyMind && !suppress) || (!clearMyMind && !suppress),
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${calmHome ? "companion-background-calm" : ""}${clearMyMind && !suppress ? " companion-background-clear-my-mind" : ""}`}
      aria-hidden="true"
      data-home-calm={calmHome ? "" : undefined}
      data-clear-my-mind={clearMyMind ? "" : undefined}
      data-background-suppressed={suppress ? "" : undefined}
    >
      {/* Warm gradient base — always present as a fallback. */}
      <div className="companion-bg-base absolute inset-0 bg-gradient-to-br from-[#f7f0e6] via-[#f2ebe2] to-[#ebe4da]" />

      {photoUrl ? (
        <div
          key={photoUrl}
          className={`${SCENE_BG_IMAGE_CLASS} companion-bg-scene absolute inset-0 ${clearMyMind ? "" : "companion-scene-fade transition-opacity duration-700"}`}
          style={{
            backgroundImage: `url('${photoUrl}')`,
            opacity: clearMyMind ? "1" : undefined,
          }}
          data-testid={
            clearMyMind ? "clear-my-mind-page-backdrop" : undefined
          }
        />
      ) : null}

      {showAtmosphere ? (
        <>
          {/* Warm wash so dark text + glass cards stay readable over any photo. */}
          <div
            className="companion-bg-wash absolute inset-0"
            style={{
              background: clearMyMind
                ? "rgba(255, 248, 232, 0.08)"
                : SCENE_OVERLAY,
            }}
          />

          {/* Subtle texture + vignette for depth. */}
          <div className="companion-noise absolute inset-0 opacity-[0.03]" />
          <div
            className="companion-bg-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(35,30,26,0.12)_100%)]"
            style={clearMyMind ? { opacity: 0.22 } : undefined}
          />
        </>
      ) : null}
    </div>
  );
}
