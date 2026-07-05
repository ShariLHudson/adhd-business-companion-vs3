"use client";

import {
  BACK_TO_ESTATE,
  formatAppBackLabel,
  isEstateHomeDestination,
} from "@/lib/navigationBack";

type Props = {
  onClick: () => void;
  className?: string;
  /** Visible label — defaults to Back To Estate. */
  label?: string;
};

/**
 * Minimal back control for full-bleed estate rooms — no app chrome.
 */
export function EstateImmersiveHomeLink({
  onClick,
  className = "",
  label = BACK_TO_ESTATE,
}: Props) {
  const visibleLabel = isEstateHomeDestination(label)
    ? BACK_TO_ESTATE
    : label;
  const ariaLabel = isEstateHomeDestination(label)
    ? BACK_TO_ESTATE
    : formatAppBackLabel(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`estate-immersive-home-link ${className}`.trim()}
      data-testid="estate-room-home-link"
      aria-label={ariaLabel}
    >
      <span className="estate-immersive-home-link__arrow" aria-hidden="true">
        ←
      </span>
      <span className="estate-immersive-home-link__label">{visibleLabel}</span>
    </button>
  );
}
