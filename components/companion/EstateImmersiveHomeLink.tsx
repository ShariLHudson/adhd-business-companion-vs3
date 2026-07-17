"use client";

import {
  WELCOME_HOME_NAV_LABEL,
  formatAppBackLabel,
  isEstateHomeDestination,
} from "@/lib/navigationBack";

type Props = {
  onClick: () => void;
  className?: string;
  /** Visible label — defaults to Welcome Home. */
  label?: string;
};

/**
 * Persistent top-left return control — always Welcome Home lobby.
 */
export function EstateImmersiveHomeLink({
  onClick,
  className = "",
  label = WELCOME_HOME_NAV_LABEL,
}: Props) {
  const visibleLabel = isEstateHomeDestination(label)
    ? WELCOME_HOME_NAV_LABEL
    : label;
  const ariaLabel = isEstateHomeDestination(label)
    ? WELCOME_HOME_NAV_LABEL
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
