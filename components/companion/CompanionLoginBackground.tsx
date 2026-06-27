"use client";

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

type Props = {
  /** Soft overlay — keeps porch visible while helping card readability */
  soften?: boolean;
};

/** Full-viewport shari-login porch — static background only. */
export function CompanionLoginBackground({ soften = true }: Props) {
  return (
    <div
      className="companion-login-scene pointer-events-none absolute inset-0 -z-10"
      aria-hidden
      data-testid="companion-login-scene"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COMPANION_LOGIN_BACKGROUND}
        alt=""
        className="companion-login-scene__base"
        fetchPriority="high"
        decoding="async"
      />

      {soften ? (
        <div className="companion-login-scene__soften" aria-hidden />
      ) : null}
    </div>
  );
}
