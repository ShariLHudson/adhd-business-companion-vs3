"use client";

import { formatAppBackLabel, NAV_HOME } from "@/lib/navigationBack";

type Props = {
  onClick: () => void;
  className?: string;
  /** Visible label — defaults to estate Home. */
  label?: string;
};

/**
 * Minimal back control for full-bleed estate rooms — no app chrome.
 */
export function EstateImmersiveHomeLink({
  onClick,
  className = "",
  label = NAV_HOME,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`estate-immersive-home-link ${className}`.trim()}
      data-testid="estate-room-home-link"
      aria-label={formatAppBackLabel(label)}
    >
      <span className="estate-immersive-home-link__arrow" aria-hidden="true">
        ←
      </span>
      <span className="estate-immersive-home-link__label">{label}</span>
    </button>
  );
}
