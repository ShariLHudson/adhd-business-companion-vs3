"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import type { JournalUnwrapStep } from "@/lib/journalGazebo/journalRevealTypes";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalRevealCover } from "./JournalRevealCover";

type Props = {
  journal: JournalGazeboConfig;
  step: JournalUnwrapStep;
  onAdvance: () => void;
};

const PROMPTS: Record<JournalUnwrapStep, string> = {
  ribbon: "Pull the ribbon",
  paper: "Open the wrapping",
  lid: "Lift the lid",
};

type RibbonBeat = "idle" | "pulling" | "loosening" | "sliding";

export function UnwrapStage({ journal, step, onAdvance }: Props) {
  const reduceMotion = useReducedMotion();
  const [ribbonBeat, setRibbonBeat] = useState<RibbonBeat>("idle");
  const busy = step === "ribbon" && ribbonBeat !== "idle";

  const runRibbonPull = useCallback(() => {
    if (reduceMotion) {
      onAdvance();
      return;
    }
    if (ribbonBeat !== "idle") return;
    setRibbonBeat("pulling");
    window.setTimeout(() => setRibbonBeat("loosening"), 420);
    window.setTimeout(() => setRibbonBeat("sliding"), 820);
    window.setTimeout(() => {
      setRibbonBeat("idle");
      onAdvance();
    }, 1480);
  }, [onAdvance, reduceMotion, ribbonBeat]);

  const handleActivate = useCallback(() => {
    if (busy) return;
    if (step === "ribbon") {
      runRibbonPull();
      return;
    }
    onAdvance();
  }, [busy, onAdvance, runRibbonPull, step]);

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-unwrap">
      <button
        type="button"
        className={[
          "journal-reveal__gift",
          step === "ribbon" ? "journal-reveal__gift--ribbon-pull" : "",
          ribbonBeat !== "idle" ? `journal-reveal__gift--ribbon-${ribbonBeat}` : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleActivate();
          }
        }}
        aria-label={PROMPTS[step]}
        aria-busy={busy || undefined}
        data-testid={`journal-reveal-unwrap-${step}`}
        data-unwrap-step={step}
        data-leather={journal.leatherColor}
        disabled={busy}
      >
        <div
          className="journal-reveal__box"
          data-leather={journal.leatherColor}
        >
          <AnimatePresence>
            {step !== "lid" ? (
              <motion.div
                key="paper"
                className="journal-reveal__paper"
                data-leather={journal.leatherColor}
                initial={false}
                animate={
                  step === "paper"
                    ? reduceMotion
                      ? { opacity: 0.35 }
                      : { rotate: -10, y: -22, scale: 1.06, opacity: 0.82 }
                    : { opacity: 1, rotate: 0, y: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -48, rotate: -14, scale: 1.1 }
                }
                transition={{ duration: reduceMotion ? 0.15 : 0.75, ease: [0.22, 0.8, 0.28, 1] }}
              >
                <span className="journal-reveal__paper-sheen" />
                <span className="journal-reveal__paper-flame" aria-hidden="true" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="rh"
                className="journal-reveal__ribbon-h"
                animate={
                  ribbonBeat === "pulling"
                    ? { scaleX: 1.08, x: 6 }
                    : ribbonBeat === "loosening"
                      ? { scaleX: 1.12, y: 4, rotate: 3 }
                      : ribbonBeat === "sliding"
                        ? { x: 140, opacity: 0, rotate: 14 }
                        : { scaleX: 1, x: 0, opacity: 1, rotate: 0 }
                }
                transition={{
                  duration: ribbonBeat === "pulling" ? 0.4 : 0.55,
                  ease: ribbonBeat === "pulling" ? [0.4, 0.05, 0.55, 0.95] : "easeOut",
                }}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="rv"
                className="journal-reveal__ribbon-v"
                animate={
                  ribbonBeat === "pulling"
                    ? { scaleY: 1.1, y: -8 }
                    : ribbonBeat === "loosening"
                      ? { scaleY: 1.14, y: -4, rotate: -4 }
                      : ribbonBeat === "sliding"
                        ? { y: -140, opacity: 0, rotate: -10 }
                        : { scaleY: 1, y: 0, opacity: 1, rotate: 0 }
                }
                transition={{
                  duration: ribbonBeat === "pulling" ? 0.42 : 0.58,
                  ease: ribbonBeat === "pulling" ? [0.45, 0.05, 0.5, 0.95] : "easeOut",
                }}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {step === "ribbon" ? (
              <motion.span
                key="bow"
                className="journal-reveal__bow"
                animate={
                  ribbonBeat === "pulling"
                    ? { scale: 1.06, y: -4 }
                    : ribbonBeat === "loosening"
                      ? { scale: 0.92, y: -10, rotate: -8 }
                      : ribbonBeat === "sliding"
                        ? { scale: 0.35, y: -36, opacity: 0, rotate: -22 }
                        : { scale: 1, y: 0, opacity: 1, rotate: 0 }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
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
              animate={{ opacity: step === "lid" ? 1 : 0.72, y: 0 }}
              aria-hidden="true"
            >
              <JournalRevealCover journal={journal} compact />
            </motion.div>
          ) : null}
        </div>
      </button>

      <button
        type="button"
        className="journal-reveal__unwrap-prompt"
        onClick={handleActivate}
        disabled={busy}
      >
        {PROMPTS[step]}
      </button>
    </div>
  );
}
