"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  onOpenGift: () => void;
};

export function WrappedGiftStage({ onOpenGift }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-wrapped">
      <button
        type="button"
        className="journal-reveal__gift"
        onClick={onOpenGift}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenGift();
          }
        }}
        aria-label="Open your gift"
        data-testid="journal-reveal-gift-button"
      >
        <motion.span
          className="journal-reveal__gift-motion"
          initial={reduceMotion ? false : { scale: 0.96 }}
          animate={
            reduceMotion
              ? { scale: 1 }
              : {
                  scale: [1, 1.02, 1],
                  filter: [
                    "brightness(1)",
                    "brightness(1.08)",
                    "brightness(1)",
                  ],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {!reduceMotion ? (
            <motion.span
              className="journal-reveal__glow"
              animate={{ opacity: [0.4, 0.85, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          ) : null}
          <div className="journal-reveal__box">
            <div className="journal-reveal__paper">
              <span className="journal-reveal__paper-sheen" />
            </div>
            <span className="journal-reveal__ribbon-h" />
            <span className="journal-reveal__ribbon-v" />
            <span className="journal-reveal__bow" aria-hidden="true">
              <span className="journal-reveal__bow-loop journal-reveal__bow-loop--l" />
              <span className="journal-reveal__bow-loop journal-reveal__bow-loop--r" />
              <span className="journal-reveal__bow-knot" />
              <span className="journal-reveal__bow-tail journal-reveal__bow-tail--l" />
              <span className="journal-reveal__bow-tail journal-reveal__bow-tail--r" />
            </span>
          </div>
        </motion.span>
      </button>

      <div className="journal-reveal__cta">
        <strong>Your journal is ready</strong>
        <span>Open your gift</span>
      </div>
      <p className="journal-reveal__hint">Click or press Enter to begin unwrapping</p>
    </div>
  );
}
