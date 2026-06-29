"use client";

import { TOP_BAR_SIGN_BTN } from "@/lib/menuNavStyles";

type Props = {
  menuId: string;
  objectId: string;
  label: string;
  onClick: () => void;
  badge?: number;
  active?: boolean;
};

/** Single-click top nav — wooden sign, text only. */
export function TopBarNavButton({
  menuId,
  label,
  onClick,
  badge,
  active = false,
}: Props) {
  return (
    <button
      type="button"
      className={`${TOP_BAR_SIGN_BTN}${active ? " top-bar-homestead-sign--active" : ""}`}
      title={label}
      aria-label={badge ? `${label}, ${badge} active items` : label}
      aria-current={active ? "page" : undefined}
      data-top-bar-menu={menuId}
      onClick={onClick}
    >
      <span className="top-bar-homestead-sign__hanger" aria-hidden="true" />
      <span className="top-bar-homestead-sign__lantern-glow" aria-hidden="true" />
      <span className="top-bar-homestead-sign__board">
        <span className="top-bar-homestead-sign__label">{label}</span>
        {badge != null && badge > 0 ? (
          <span className="top-bar-homestead-sign__badge">{badge}</span>
        ) : null}
      </span>
    </button>
  );
}
