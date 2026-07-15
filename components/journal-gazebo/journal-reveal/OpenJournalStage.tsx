"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import {
  JOURNAL_REVEAL_OPENING_MS,
  JOURNAL_REVEAL_OPENING_REDUCED_MS,
} from "@/lib/journalGazebo/journalRevealTypes";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalRevealCover } from "./JournalRevealCover";

type Props = {
  journal: JournalGazeboConfig;
  onOpened: () => void;
};

export function OpenJournalStage({ journal, onOpened }: Props) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion
    ? JOURNAL_REVEAL_OPENING_REDUCED_MS
    : JOURNAL_REVEAL_OPENING_MS;

  useEffect(() => {
    const id = window.setTimeout(onOpened, duration);
    return () => window.clearTimeout(id);
  }, [duration, onOpened]);

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-opening">
      <motion.div
        className="journal-reveal__gift journal-reveal__gift--idle"
        aria-hidden="true"
      >
        <div className="journal-reveal__box" style={{ background: "transparent", boxShadow: "none" }}>
          <motion.div
            className="journal-reveal__journal"
            style={{ inset: "4% 8% 6%", transformOrigin: "left center" }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: reduceMotion ? -12 : -68 }}
            transition={{ duration: reduceMotion ? 0.12 : 1.35, ease: [0.22, 0.8, 0.28, 1] }}
          >
            <JournalRevealCover journal={journal} />
          </motion.div>
        </div>
      </motion.div>
      <p className="journal-reveal__message" role="status">
        Entering the Journal Gazebo…
      </p>
    </div>
  );
}
