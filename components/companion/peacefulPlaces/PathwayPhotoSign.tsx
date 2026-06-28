"use client";

import type { CSSProperties, ReactNode, PointerEvent } from "react";
import type { PathwaySignAnchor } from "@/lib/peacefulPlaces/pathwaySignAnchors";

type Props = {
  id: string;
  label: string;
  anchor: PathwaySignAnchor;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
};

export function PathwayPhotoSign({
  id,
  label,
  anchor,
  open,
  onToggle,
  children,
}: Props) {
  const position: CSSProperties = {
    left: `${anchor.centerX}%`,
    top: `${anchor.centerY}%`,
    width: `${anchor.width}%`,
    height: `${anchor.height}%`,
    transform: "translate(-50%, -50%)",
  };

  function handleActivate(e: PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <div
      className={`pathway-photo-sign pathway-photo-sign--align-${anchor.dropdownAlign}`}
      data-sign-id={id}
      data-open={open ? "1" : undefined}
      style={position}
    >
      <button
        type="button"
        id={`pathway-photo-sign-${id}`}
        className="pathway-photo-sign__hit"
        aria-expanded={open}
        aria-controls={open ? `pathway-photo-menu-${id}` : undefined}
        aria-label={`${label} — choose a place`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleActivate}
      >
        <span className="sr-only">{label}</span>
      </button>
      {open && children ? (
        <div
          id={`pathway-photo-menu-${id}`}
          role="region"
          aria-labelledby={`pathway-photo-sign-${id}`}
          className="pathway-photo-sign__dropdown"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
