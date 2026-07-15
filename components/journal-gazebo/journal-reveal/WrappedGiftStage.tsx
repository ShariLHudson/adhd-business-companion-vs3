"use client";

import { motion, useReducedMotion } from "framer-motion";
import { journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  journal: JournalGazeboConfig;
  onOpenGift: () => void;
};

export function WrappedGiftStage({ journal, onOpenGift }: Props) {
  const reduceMotion = useReducedMotion();
  const title = journalCoverTitle(journal);

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
        aria-label={`Open your gift — ${title}`}
        data-testid="journal-reveal-gift-button"
        data-leather={journal.leatherColor}
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
          <div className="journal-reveal__box" data-leather={journal.leatherColor}>
            <div
              className="journal-reveal__paper"
              data-leather={journal.leatherColor}
            >
              <span className="journal-reveal__paper-sheen" />
              <span className="journal-reveal__paper-flame" aria-hidden="true" />
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
