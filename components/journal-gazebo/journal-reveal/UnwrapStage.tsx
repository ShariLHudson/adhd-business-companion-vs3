"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { JournalUnwrapStep } from "@/lib/journalGazebo/journalRevealTypes";

type Props = {
  step: JournalUnwrapStep;
  onAdvance: () => void;
};

const PROMPTS: Record<JournalUnwrapStep, string> = {
  ribbon: "Pull the ribbon",
  paper: "Open the wrapping",
  lid: "Lift the lid",
};

export function UnwrapStage({ step, onAdvance }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-unwrap">
      <button
        type="button"
        className="journal-reveal__gift"
        onClick={onAdvance}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAdvance();
          }
        }}
        aria-label={PROMPTS[step]}
        data-testid={`journal-reveal-unwrap-${step}`}
        data-unwrap-step={step}
      >
        <div className="journal-reveal__box">
          <AnimatePresence>
            {step !== "lid" ? (
              <motion.div
                key="paper"
                className="journal-reveal__paper"
                initial={false}
                animate={
                  step === "paper"
                    ? reduceMotion
                      ? { opacity: 0.35 }
                      : { rotate: -8, y: -18, scale: 1.05, opacity: 0.85 }
                    : { opacity: 1, rotate: 0, y: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -40, rotate: -12, scale: 1.08 }
                }
                transition={{ duration: reduceMotion ? 0.15 : 0.7 }}
              >
                <span className="journal-reveal__paper-sheen" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="rh"
                className="journal-reveal__ribbon-h"
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { x: 120, opacity: 0, rotate: 12 }
                }
                transition={{ duration: reduceMotion ? 0.12 : 0.65 }}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="rv"
                className="journal-reveal__ribbon-v"
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { y: -120, opacity: 0, rotate: -8 }
                }
                transition={{ duration: reduceMotion ? 0.12 : 0.65 }}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="bow"
                className="journal-reveal__bow"
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { scale: 0.4, y: -30, opacity: 0, rotate: -20 }
                }
                transition={{ duration: reduceMotion ? 0.12 : 0.55 }}
                aria-hidden="true"
              >
                <span className="journal-reveal__bow-loop journal-reveal__bow-loop--l" />
                <span className="journal-reveal__bow-loop journal-reveal__bow-loop--r" />
                <span className="journal-reveal__bow-knot" />
                <span className="journal-reveal__bow-tail journal-reveal__bow-tail--l" />
                <span className="journal-reveal__bow-tail journal-reveal__bow-tail--r" />
              </motion.span>
            ) : null}
          </AnimatePresence>

          {step === "lid" || step === "paper" ? (
            <motion.div
              className="journal-reveal__journal"
              initial={reduceMotion ? false : { opacity: 0.35, y: 12 }}
              animate={{ opacity: step === "lid" ? 0.9 : 0.55, y: 0 }}
              aria-hidden="true"
            >
              <div className="journal-reveal__journal-cover" data-leather="espresso" />
            </motion.div>
          ) : null}
        </div>
      </button>

      <button
        type="button"
        className="journal-reveal__unwrap-prompt"
        onClick={onAdvance}
      >
        {PROMPTS[step]}
      </button>
    </div>
  );
}
