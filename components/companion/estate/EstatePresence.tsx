"use client";

import type { CSSProperties } from "react";
import type { EstatePresenceLayer } from "@/lib/estate/estatePresence/types";
import { resolveEstatePresenceProfile } from "@/lib/estate/estatePresence/registry";
import { useEstatePresencePaused } from "@/lib/estate/estatePresence/useEstatePresencePaused";

type Props = {
  roomId: string;
  className?: string;
};

function layerStyle(layer: EstatePresenceLayer): CSSProperties {
  return {
    top: layer.top,
    left: layer.left,
    right: layer.right,
    bottom: layer.bottom,
    width: layer.width,
    height: layer.height,
  };
}

function delayClass(delay?: EstatePresenceLayer["delay"]): string {
  if (!delay) return "";
  return `estate-presence__layer--delay-${delay}`;
}

function PresenceLayer({ layer }: { layer: EstatePresenceLayer }) {
  const style = layerStyle(layer);
  const delay = delayClass(layer.delay);

  if (layer.kind === "dust") {
    return (
      <div
        className={`estate-presence__dust ${delay}`}
        style={style}
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    );
  }

  if (layer.kind === "star-twinkle") {
    return (
      <div
        className={`estate-presence__stars ${delay}`}
        style={style}
        aria-hidden
      >
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    );
  }

  if (
    layer.kind === "lantern" ||
    layer.kind === "candle" ||
    layer.kind === "fireplace"
  ) {
    return (
      <div
        className={`estate-light-glow estate-light-glow--${layer.kind} estate-presence__light ${delay}`}
        style={style}
        aria-hidden
        data-estate-light={layer.kind}
        {...(layer.delay ? { "data-estate-light-delay": String(layer.delay) } : {})}
      />
    );
  }

  return (
    <div
      className={`estate-presence__layer estate-presence__layer--${layer.kind} ${delay}`}
      style={style}
      aria-hidden
      {...(layer.variant ? { "data-variant": layer.variant } : {})}
    />
  );
}

/**
 * Estate Presence™ — subtle environmental life above the room plate, below UI.
 */
export function EstatePresence({ roomId, className = "" }: Props) {
  const paused = useEstatePresencePaused();
  const profile = resolveEstatePresenceProfile(roomId);

  if (!profile?.layers.length) return null;

  return (
    <div
      className={`estate-presence ${className}`.trim()}
      data-estate-presence-room={roomId}
      data-paused={paused ? "true" : undefined}
      data-testid="estate-presence"
      aria-hidden
    >
      {profile.layers.map((layer, index) => (
        <PresenceLayer key={`${layer.kind}-${index}`} layer={layer} />
      ))}
    </div>
  );
}
