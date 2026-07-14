"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  JOURNAL_REVEAL_CREATING_MS,
  JOURNAL_REVEAL_CREATING_SHORT_MS,
  type JournalRevealFlowProps,
  type JournalRevealState,
  type JournalUnwrapStep,
} from "@/lib/journalGazebo/journalRevealTypes";
import { JournalRevealStage } from "./JournalRevealStage";
import { OpenJournalStage } from "./OpenJournalStage";
import { UnwrapStage } from "./UnwrapStage";
import { WrappedGiftStage } from "./WrappedGiftStage";
import { WrappingStage } from "./WrappingStage";
import "./journal-reveal.css";

const UNWRAP_ORDER: JournalUnwrapStep[] = ["ribbon", "paper", "lid"];

/**
 * Ceremonial gift reveal after journal creation.
 * Completion + celebration — never a loading spinner.
 */
export function JournalRevealFlow({
  journal,
  isFirstCreation = true,
  onComplete,
}: JournalRevealFlowProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const completedRef = useRef(false);

  const initialState: JournalRevealState =
    reduceMotion || !isFirstCreation ? "wrapped" : "creating";

  const [state, setState] = useState<JournalRevealState>(initialState);
  const [unwrapStep, setUnwrapStep] = useState<JournalUnwrapStep>("ribbon");

  const finish = useCallback(
    (meta: { skipped: boolean; opened: boolean }) => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete(journal, meta);
    },
    [journal, onComplete],
  );

  const skipReveal = useCallback(() => {
    finish({ skipped: true, opened: false });
  }, [finish]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        skipReveal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skipReveal]);

  const creatingDuration = reduceMotion
    ? JOURNAL_REVEAL_CREATING_SHORT_MS
    : isFirstCreation
      ? JOURNAL_REVEAL_CREATING_MS
      : JOURNAL_REVEAL_CREATING_SHORT_MS;

  const handleWrappingReady = useCallback(() => {
    setState("wrapped");
  }, []);

  const handleOpenGift = useCallback(() => {
    if (reduceMotion) {
      setState("revealed");
      return;
    }
    setUnwrapStep("ribbon");
    setState("unwrapping");
  }, [reduceMotion]);

  const handleUnwrapAdvance = useCallback(() => {
    const idx = UNWRAP_ORDER.indexOf(unwrapStep);
    const next = UNWRAP_ORDER[idx + 1];
    if (!next) {
      setState("revealed");
      return;
    }
    setUnwrapStep(next);
  }, [unwrapStep]);

  const handleOpenJournal = useCallback(() => {
    setState("opening");
  }, []);

  const handleOpened = useCallback(() => {
    finish({ skipped: false, opened: true });
  }, [finish]);

  return (
    <div
      className="journal-reveal"
      data-testid="journal-reveal-flow"
      data-reveal-state={state}
      data-first-creation={isFirstCreation ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <span className="journal-reveal__veil" aria-hidden="true" />

      <button
        type="button"
        className="journal-reveal__skip"
        onClick={skipReveal}
        data-testid="journal-reveal-skip"
      >
        Skip reveal
      </button>

      <h2
        id={titleId}
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Your journal gift
      </h2>

      <div
        className="journal-reveal__stage-host"
        data-testid="journal-reveal-stage-host"
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={state === "unwrapping" ? `unwrap-${unwrapStep}` : state}
            initial={reduceMotion ? false : { opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            style={{ width: "100%", display: "grid", placeItems: "center" }}
          >
            {state === "creating" ? (
              <WrappingStage
                durationMs={creatingDuration}
                onReady={handleWrappingReady}
              />
            ) : null}
            {state === "wrapped" ? (
              <WrappedGiftStage onOpenGift={handleOpenGift} />
            ) : null}
            {state === "unwrapping" ? (
              <UnwrapStage step={unwrapStep} onAdvance={handleUnwrapAdvance} />
            ) : null}
            {state === "revealed" ? (
              <JournalRevealStage
                journal={journal}
                onOpenJournal={handleOpenJournal}
              />
            ) : null}
            {state === "opening" ? (
              <OpenJournalStage journal={journal} onOpened={handleOpened} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
