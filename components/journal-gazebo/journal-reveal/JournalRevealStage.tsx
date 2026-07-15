"use client";

import { motion, useReducedMotion } from "framer-motion";
import { journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalRevealCover } from "./JournalRevealCover";

type Props = {
  journal: JournalGazeboConfig;
  onOpenJournal: () => void;
};

const PARTICLE_SLOTS = [
  { left: "18%", top: "22%", delay: 0 },
  { left: "72%", top: "28%", delay: 0.35 },
  { left: "40%", top: "14%", delay: 0.7 },
  { left: "58%", top: "70%", delay: 0.2 },
  { left: "28%", top: "68%", delay: 0.55 },
  { left: "80%", top: "55%", delay: 0.9 },
];

export function JournalRevealStage({ journal, onOpenJournal }: Props) {
  const reduceMotion = useReducedMotion();
  const title = journalCoverTitle(journal);

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-journal">
      <button
        type="button"
        className="journal-reveal__gift"
        onClick={onOpenJournal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenJournal();
          }
        }}
        aria-label={`Open ${title}`}
        data-testid="journal-reveal-open-journal"
      >
        <motion.span
          className="journal-reveal__gift-motion"
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.8, ease: "easeOut" }}
        >
          {!reduceMotion ? (
            <>
              <motion.span
                className="journal-reveal__glow"
                animate={{ opacity: [0.45, 0.95, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
              <span className="journal-reveal__particles" aria-hidden="true">
                {PARTICLE_SLOTS.map((p) => (
                  <motion.span
                    key={`${p.left}-${p.top}`}
                    className="journal-reveal__particle"
                    style={{ left: p.left, top: p.top }}
                    animate={{ y: [0, -18, 0], opacity: [0.2, 0.95, 0.2] }}
                    transition={{
                      duration: 2.6,
                      delay: p.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </span>
            </>
          ) : null}

          <div
            className="journal-reveal__box"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <motion.div
              className="journal-reveal__journal"
              style={{ inset: "4% 8% 6%" }}
              initial={
                reduceMotion ? false : { y: 24, filter: "brightness(0.85)" }
              }
              animate={{ y: 0, filter: "brightness(1.05)" }}
              transition={{ duration: reduceMotion ? 0.1 : 0.9 }}
            >
              <JournalRevealCover journal={journal} />
            </motion.div>
          </div>
        </motion.span>
      </button>

      <p className="journal-reveal__message" role="status">
        Your journal is here.
      </p>
      <p className="journal-reveal__hint">Open it to enter the Journal Gazebo</p>
    </div>
  );
}
