"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { GardenBannerDropdown } from "@/components/companion/peacefulPlaces/GardenBannerDropdown";
import { GardenFlagPhoto } from "@/components/companion/peacefulPlaces/GardenFlagPhoto";
import { gardenFlagPlaqueFor } from "@/lib/peacefulPlaces/gardenFlagMarkers";
import { gardenFlagPhotoFor } from "@/lib/peacefulPlaces/gardenFlagPhotos";
import type { EstateSignId } from "@/lib/peacefulPlaces/signpostLayout";

type Props = {
  id: EstateSignId;
  label: string;
  side: "left" | "right";
  open: boolean;
  hovered: boolean;
  selected: boolean;
  onHoverChange: (id: EstateSignId | null) => void;
  onToggle: () => void;
  onMenuPointerEnter?: () => void;
  onMenuPointerLeave?: () => void;
  children?: ReactNode;
};

/** Luxury garden banner — linen sailcloth on wrought iron, trail-marker layout. */
export function GardenFlagStake({
  id,
  label,
  side,
  open,
  hovered,
  selected,
  onHoverChange,
  onToggle,
  onMenuPointerEnter,
  onMenuPointerLeave,
  children,
}: Props) {
  const flagRef = useRef<HTMLButtonElement>(null);
  const photo = gardenFlagPhotoFor(id);
  const plaque = gardenFlagPlaqueFor(id);

  function handleToggle(e: PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onToggle();
  }

  return (
    <div
      className={`pathway-garden-stake pathway-garden-stake--${side}`}
      data-sign-id={id}
      data-open={open ? "1" : undefined}
      data-hovered={hovered ? "1" : undefined}
      data-selected={selected ? "1" : undefined}
      onPointerEnter={() => onHoverChange(id)}
      onPointerLeave={() => onHoverChange(null)}
      style={
        {
          ["--flag-band" as string]: photo.band,
          ["--flag-label" as string]: photo.labelColor,
        } as CSSProperties
      }
    >
      <div className="pathway-garden-stake__life" aria-hidden="true">
        <span className="pathway-garden-stake__life-sprite pathway-garden-stake__life-sprite--a" />
        <span className="pathway-garden-stake__life-sprite pathway-garden-stake__life-sprite--b" />
      </div>
      <div className="pathway-garden-stake__mount">
        <div className="pathway-garden-stake__iron" aria-hidden="true">
          <div className="pathway-garden-stake__iron-arm">
            <span className="pathway-garden-stake__iron-hook" />
          </div>
        </div>
        <div className="pathway-garden-stake__hangers" aria-hidden="true">
          <span className="pathway-garden-stake__grommet" />
          <span className="pathway-garden-stake__grommet" />
        </div>
        <div className="pathway-garden-stake__banner">
          <button
            ref={flagRef}
            type="button"
            id={`pathway-garden-flag-${id}`}
            aria-expanded={open}
            aria-controls={open ? `pathway-garden-menu-${id}` : undefined}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleToggle}
            className="pathway-garden-stake__flag"
          >
            <span className="pathway-garden-stake__fabric">
              <span className="pathway-garden-stake__fabric-texture" aria-hidden="true" />
              <span className="pathway-garden-stake__fabric-light" aria-hidden="true" />
              <span className="pathway-garden-stake__stitch" aria-hidden="true" />
              <span className="pathway-garden-stake__photo-frame">
                <GardenFlagPhoto id={id} />
              </span>
              <span className="pathway-garden-stake__nameplate">
                <span className="pathway-garden-stake__label">{label}</span>
              </span>
              <span className="pathway-garden-stake__hem-shadow" aria-hidden="true" />
              <span className="pathway-garden-stake__corner-curl" aria-hidden="true" />
            </span>
          </button>
        </div>
        <div className="pathway-garden-stake__planted">
          <div className="pathway-garden-stake__post" aria-hidden="true" />
          <div className="pathway-garden-stake__earth" aria-hidden="true">
            <div className="pathway-garden-stake__ground-shadow" />
            <div className="pathway-garden-stake__soil-mound" />
            <div className="pathway-garden-stake__grass-lip" />
          </div>
        </div>
      </div>
      <p className="pathway-garden-stake__plaque" aria-hidden={!hovered}>
        {plaque}
      </p>
      {open && children ? (
        <GardenBannerDropdown
          anchorRef={flagRef}
          side={side}
          open={open}
          onMenuPointerEnter={onMenuPointerEnter}
          onMenuPointerLeave={onMenuPointerLeave}
        >
          <div
            id={`pathway-garden-menu-${id}`}
            role="region"
            aria-labelledby={`pathway-garden-flag-${id}`}
            className="pathway-garden-stake__menu"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </GardenBannerDropdown>
      ) : null}
    </div>
  );
}
