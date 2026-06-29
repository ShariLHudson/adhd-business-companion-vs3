"use client";

import type { ReactNode, PointerEvent } from "react";

type Props = {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  armLength?: "short" | "medium" | "long";
  /** Woodland pathway — one shared arm per column; hide per-sign arms. */
  showArm?: boolean;
  children?: ReactNode;
};

export function HangingEstateSign({
  id,
  label,
  open,
  onToggle,
  armLength = "medium",
  showArm = true,
  children,
}: Props) {
  function handleToggle(e: PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <div
      className={`hanging-estate-sign hanging-estate-sign--arm-${armLength}`}
      data-sign-id={id}
      data-open={open ? "1" : undefined}
    >
      {showArm ? <div className="hanging-estate-sign__iron-arm" aria-hidden="true" /> : null}
      <div className="hanging-estate-sign__chains" aria-hidden="true">
        <span className="hanging-estate-sign__chain" />
        <span className="hanging-estate-sign__chain" />
      </div>
      <button
        type="button"
        id={`estate-hanging-sign-${id}`}
        aria-expanded={open}
        aria-controls={open ? `estate-hanging-menu-${id}` : undefined}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleToggle}
        className="hanging-estate-sign__plaque"
      >
        <span className="hanging-estate-sign__label">{label}</span>
      </button>
      {open && children ? (
        <div
          id={`estate-hanging-menu-${id}`}
          role="region"
          aria-labelledby={`estate-hanging-sign-${id}`}
          className="hanging-estate-sign__dropdown"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="hanging-estate-sign__dropdown-chain" aria-hidden="true" />
          {children}
        </div>
      ) : null}
    </div>
  );
}
