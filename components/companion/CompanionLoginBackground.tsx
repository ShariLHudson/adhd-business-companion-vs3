"use client";

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";
import { useHomesteadSceneSurfaceProps } from "@/lib/homesteadScene";
import { HomesteadSceneLayers } from "./HomesteadSceneLayers";

type Props = {
  /** Soft overlay — keeps porch visible while helping card readability */
  soften?: boolean;
};

/** Full-viewport shari-login porch — same homestead lighting as home. */
export function CompanionLoginBackground({ soften = true }: Props) {
  const { surfaceProps } = useHomesteadSceneSurfaceProps({
    surface: "login",
    className:
      "companion-login-scene homestead-scene-surface pointer-events-none absolute inset-0 -z-10",
  });

  return (
    <div {...surfaceProps} data-testid="companion-login-scene" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COMPANION_LOGIN_BACKGROUND}
        alt=""
        className="companion-login-scene__base"
        fetchPriority="high"
        decoding="async"
      />

      <HomesteadSceneLayers />

      {soften ? (
        <div className="companion-login-scene__soften" aria-hidden />
      ) : null}
    </div>
  );
}
