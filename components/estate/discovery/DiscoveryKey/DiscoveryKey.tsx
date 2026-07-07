"use client";

import type { CSSProperties } from "react";
import type { RoomPlacementSelection } from "@/lib/estateDiscovery/types";

type DiscoveryKeyProps = {
  placement: RoomPlacementSelection;
  onClick: () => void;
  unlocking?: boolean;
};

const DISCOVERY_KEY_IMAGE = "/images/discovery-key.png";

export function DiscoveryKey({
  placement,
  onClick,
  unlocking = false,
}: DiscoveryKeyProps) {
  const style: CSSProperties = {
    position: "absolute",
    left: `${placement.xPercent}%`,
    top: `${placement.yPercent}%`,
    transform: `translate(-50%, -50%) rotate(${placement.rotationDegrees}deg) scale(${placement.scale})`,
    zIndex: placement.depthLayer === "foreground" ? 12 : 8,
    filter: placement.shadow.enabled
      ? `drop-shadow(0 ${placement.shadow.offsetYPercent}% ${placement.shadow.blurPx}px rgba(0,0,0,${placement.shadow.opacity}))`
      : undefined,
    transition: unlocking ? "transform 0.45s ease" : undefined,
  };

  return (
    <button
      type="button"
      className="discovery-key"
      style={style}
      onClick={onClick}
      aria-label="Discovery Key"
      data-discovery-key-location={placement.locationId}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={DISCOVERY_KEY_IMAGE}
        alt=""
        aria-hidden
        style={{
          width: "clamp(3rem, 6vw, 4.5rem)",
          height: "auto",
          pointerEvents: "none",
          opacity: unlocking ? 0.85 : 1,
        }}
      />
    </button>
  );
}
