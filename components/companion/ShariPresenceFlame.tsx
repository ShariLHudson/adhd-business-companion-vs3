"use client";

/**
 * ShariPresenceFlame — one shared living-flame presence for Spark Estate.
 * Communicates: I'm here · listening · thinking · ready.
 * Not a loading spinner.
 */

import "@/app/companion/shari-presence-flame.css";
import {
  SHARI_PRESENCE_TRANSITION_MS,
  ShariPresenceState,
  type ShariPresenceFlameSize,
  type ShariPresenceSignals,
  type ShariPresenceState as PresenceState,
} from "@/lib/shariPresenceFlame/types";
import {
  resolveShariPresenceState,
  shariPresenceAriaLabel,
} from "@/lib/shariPresenceFlame/resolvePresenceState";

const SPARK_FLAME_SRC = "/images/ssc-presence-flame.png";
const SPARK_FLAME_FALLBACK = "/images/spark-estate-flame-only.jpg";

export type ShariPresenceFlameProps = {
  state?: PresenceState;
  /** When `state` is omitted, resolve from signals */
  signals?: ShariPresenceSignals;
  size?: ShariPresenceFlameSize;
  /** Overrides default aria label for the resolved state */
  label?: string;
  className?: string;
  /** Slightly warmer when companion voice audio is playing (not ambient) */
  audioWarmth?: boolean;
};

export function ShariPresenceFlame({
  state: stateProp,
  signals,
  size = "md",
  label,
  className = "",
  audioWarmth = false,
}: ShariPresenceFlameProps) {
  const state =
    stateProp ?? resolveShariPresenceState(signals ?? {});
  const aria = label?.trim() || shariPresenceAriaLabel(state);

  return (
    <span
      className={[
        "shari-presence-flame",
        `shari-presence-flame--${size}`,
        `shari-presence-flame--${state}`,
        audioWarmth && state !== ShariPresenceState.OFFLINE
          ? "shari-presence-flame--audio-warm"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={aria}
      data-testid="shari-presence-flame"
      data-presence-state={state}
      data-transition-ms={SHARI_PRESENCE_TRANSITION_MS}
      style={{
        transitionDuration: `${SHARI_PRESENCE_TRANSITION_MS}ms`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPARK_FLAME_SRC}
        alt=""
        aria-hidden="true"
        className="shari-presence-flame__mark"
        draggable={false}
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.includes("spark-estate-flame-only")) {
            img.src = SPARK_FLAME_FALLBACK;
          }
        }}
      />
    </span>
  );
}

/** @deprecated Prefer ShariPresenceFlame — kept as alias for gradual migration */
export { ShariPresenceFlame as SparkThinkingFlamePresence };
