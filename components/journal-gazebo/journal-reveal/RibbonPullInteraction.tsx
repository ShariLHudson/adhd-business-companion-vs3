"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

type Props = {
  threshold?: number;
  disabled?: boolean;
  onThresholdReached: () => void;
  /** Continuous 0–1 pull so the ribbon material moves with the hand. */
  onPullProgress?: (progress: number) => void;
};

/**
 * Physical ribbon-tail drag — the ribbon follows; then the bow releases.
 */
export function RibbonPullInteraction({
  threshold = 72,
  disabled = false,
  onThresholdReached,
  onPullProgress,
}: Props) {
  const reduceMotion = useReducedMotion();
  const firedRef = useRef(false);
  const [offset, setOffset] = useState(0);

  const report = (next: number) => {
    setOffset(next);
    onPullProgress?.(Math.min(1, Math.max(0, next / threshold)));
  };

  const fire = () => {
    if (firedRef.current || disabled) return;
    firedRef.current = true;
    onPullProgress?.(1);
    onThresholdReached();
  };

  if (reduceMotion) {
    return (
      <button
        type="button"
        className="jg-gift-ribbon-handle jg-gift-ribbon-handle--tap"
        disabled={disabled}
        onClick={fire}
        aria-label="Pull the ribbon to untie"
        data-testid="journal-reveal-ribbon-drag"
      />
    );
  }

  return (
    <motion.button
      type="button"
      className="jg-gift-ribbon-handle"
      style={{ x: offset, y: offset * -0.18 }}
      drag
      dragConstraints={{ left: 0, right: threshold + 40, top: -36, bottom: 12 }}
      dragElastic={0.22}
      dragTransition={{ bounceStiffness: 180, bounceDamping: 22 }}
      dragMomentum={false}
      disabled={disabled}
      aria-label="Drag the ribbon to untie"
      data-testid="journal-reveal-ribbon-drag"
      onDrag={(_, info) => {
        if (disabled || firedRef.current) return;
        const pulled = Math.max(0, info.offset.x - info.offset.y * 0.25);
        report(Math.min(threshold + 20, Math.max(0, pulled)));
        if (pulled >= threshold) fire();
      }}
      onDragEnd={() => {
        if (firedRef.current || disabled) return;
        // Spring back if they didn’t finish the pull
        report(0);
      }}
      onClick={(e) => {
        if (disabled || firedRef.current) return;
        // Tap the ribbon end — still frees it; pull progress snaps to full first.
        e.preventDefault();
        report(threshold);
        fire();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          report(threshold);
          fire();
        }
      }}
    />
  );
}
