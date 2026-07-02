"use client";

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

type Props = {
  /**
   * Crisp `login-welcome-background` — no homestead overlays.
   * Default on login so left and right match in clarity and color.
   */
  fullExposure?: boolean;
};

/** Full-viewport login porch — photograph only, balanced left-to-right. */
export function CompanionLoginBackground({ fullExposure = true }: Props) {
  if (!fullExposure) {
    return null;
  }

  return (
    <div
      className="companion-login-scene companion-login-scene--full-exposure pointer-events-none absolute inset-0 -z-10"
      data-testid="companion-login-scene"
      data-login-exposure="full"
      data-login-background="login-welcome-background"
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
        {/* Feathered clarity lift on the right — counters warm haze in source art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COMPANION_LOGIN_BACKGROUND}
          alt=""
          className="companion-login-scene__base companion-login-scene__base--right-balance"
          fetchPriority="high"
          decoding="async"
          aria-hidden
        />
      </div>
    </div>
  );
}
