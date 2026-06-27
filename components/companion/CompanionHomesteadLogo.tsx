"use client";

import { ASSETS } from "@/lib/companionUi";

type Props = {
  /** Hidden only when a page documents a composition conflict (e.g. full-screen overlay). */
  hidden?: boolean;
};

/** Spark Studio Companions — fixed lower-left on primary companion pages. */
export function CompanionHomesteadLogo({ hidden = false }: Props) {
  if (hidden) return null;

  return (
    <span
      className="companion-homestead-logo"
      aria-hidden="true"
      data-testid="companion-homestead-logo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.logo}
        alt=""
        className="companion-homestead-logo__img"
        draggable={false}
      />
    </span>
  );
}
