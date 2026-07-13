"use client";

/**
 * Backward-compatible entry for the shared Shari Presence Flame.
 * Loading / thinking callers use THINKING. Prefer ShariPresenceFlame for full states.
 */

import {
  ShariPresenceFlame,
} from "@/components/companion/ShariPresenceFlame";
import { ShariPresenceState } from "@/lib/shariPresenceFlame/types";
import type { ShariPresenceFlameSize } from "@/lib/shariPresenceFlame/types";

export type SparkThinkingFlameSize = ShariPresenceFlameSize;

type SparkThinkingFlameProps = {
  className?: string;
  size?: SparkThinkingFlameSize;
  /** Screen-reader label — defaults to thinking presence. */
  label?: string;
};

/**
 * Shared presence flame in THINKING state — replaces spinners / dots.
 * Same component as Estate-wide ShariPresenceFlame.
 */
export function SparkThinkingFlame({
  className = "",
  size = "md",
  label = "Shari is with you",
}: SparkThinkingFlameProps) {
  return (
    <ShariPresenceFlame
      state={ShariPresenceState.THINKING}
      size={size}
      label={label}
      className={["spark-thinking-flame", className].filter(Boolean).join(" ")}
    />
  );
}

type SparkLoadingStateProps = {
  message?: string;
  size?: SparkThinkingFlameSize;
  className?: string;
  /** Full viewport gate vs inline panel. */
  fullPage?: boolean;
};

/** Centered loading / retrieving state with the shared presence flame. */
export function SparkLoadingState({
  message = "One moment…",
  size = "lg",
  className = "",
  fullPage = false,
}: SparkLoadingStateProps) {
  return (
    <div
      className={[
        "spark-loading-state",
        fullPage ? "spark-loading-state--full" : "spark-loading-state--panel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="spark-loading-state"
    >
      <SparkThinkingFlame size={size} label={message} />
      {message ? (
        <p className="spark-loading-state__copy">{message}</p>
      ) : null}
    </div>
  );
}
