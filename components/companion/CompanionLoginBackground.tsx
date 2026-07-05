"use client";

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

type Props = {
  /** Full-bleed Welcome Home room — same photograph as the estate arrival room. */
  fullExposure?: boolean;
};

/** Full-viewport login — Welcome Home room photograph. */
export function CompanionLoginBackground({ fullExposure = true }: Props) {
  if (!fullExposure) {
    return null;
  }

  return (
    <div
      className="companion-login-scene companion-login-scene--full-exposure pointer-events-none absolute inset-0 -z-10"
      data-testid="companion-login-scene"
      data-login-exposure="full"
      data-login-background="welcome-home-background"
      aria-hidden
    >
      <div className="companion-login-scene__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COMPANION_LOGIN_BACKGROUND}
          alt=""
          className="companion-login-scene__base"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </div>
  );
}
