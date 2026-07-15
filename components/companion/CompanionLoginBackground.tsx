"use client";

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

type Props = {
  /** Full-bleed Welcome to Spark Estate threshold (not Welcome Home lobby). */
  fullExposure?: boolean;
};

/** Full-viewport login / account-access background. */
export function CompanionLoginBackground({ fullExposure = true }: Props) {
  if (!fullExposure) {
    return null;
  }

  return (
    <div
      className="companion-login-scene companion-login-scene--full-exposure pointer-events-none absolute inset-0 z-0"
      data-testid="companion-login-scene"
      data-login-exposure="full"
      data-login-background="welcome-to-spark-estate"
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
