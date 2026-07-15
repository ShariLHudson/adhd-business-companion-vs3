"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  JOURNAL_GIFT_BEAT_MS,
  JOURNAL_REVEAL_OPENING_MS,
  JOURNAL_REVEAL_OPENING_REDUCED_MS,
  type JournalGiftBeat,
  type JournalRevealFlowProps,
} from "@/lib/journalGazebo/journalRevealTypes";
import { journalCoverTitle } from "@/lib/journalGazebo/coverArt";
import {
  JournalGazeboWrappedGift,
  type GiftUnwrapMoment,
} from "../JournalGazeboWrappedGift";
import { RibbonPullInteraction } from "./RibbonPullInteraction";
import "./journal-reveal.css";

function beatToMoment(beat: JournalGiftBeat): GiftUnwrapMoment {
  return beat;
}

const CAPTIONS: Partial<
  Record<JournalGiftBeat, { title: string; sub?: string }>
> = {
  wrapped: { title: "Your journal is ready", sub: "Open your gift" },
  "ribbon-pull": { title: "Pull the ribbon", sub: "Drag gently to untie" },
  bow: { title: "Almost there…" },
  ribbon: { title: "The wrapping waits" },
  unwrap: { title: "Unwrapping your journal" },
  reveal: { title: "Your journal is here" },
  admire: { title: "Tap to open" },
  opening: { title: "" },
};

/**
 * Physical gift on the Gazebo desk — one layered object throughout.
 * Ribbon, paper, and journal pose; nothing mounts or unmounts mid-unwrap.
 */
export function JournalRevealFlow({
  journal,
  isFirstCreation = true,
  onComplete,
}: JournalRevealFlowProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const completedRef = useRef(false);
  const title = journalCoverTitle(journal);

  const [beat, setBeat] = useState<JournalGiftBeat>("wrapped");
  const [busy, setBusy] = useState(false);
  const [ribbonPull, setRibbonPull] = useState(0);

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

  const startRibbonPull = useCallback(() => {
    if (beat !== "wrapped" || busy) return;
    if (reduceMotion) {
      setBeat("admire");
      return;
    }
    setBeat("ribbon-pull");
  }, [beat, busy, reduceMotion]);

  const onRibbonFreed = useCallback(() => {
    if (beat !== "ribbon-pull" || busy) return;
    setBusy(true);
    setRibbonPull(1);
    setBeat("bow");
  }, [beat, busy]);

  useEffect(() => {
    if (!busy) return;
    if (beat === "bow") {
      const t = window.setTimeout(
        () => setBeat("ribbon"),
        reduceMotion ? 120 : JOURNAL_GIFT_BEAT_MS.bow,
      );
      return () => window.clearTimeout(t);
    }
    if (beat === "ribbon") {
      const t = window.setTimeout(
        () => setBeat("unwrap"),
        reduceMotion ? 120 : JOURNAL_GIFT_BEAT_MS.ribbon,
      );
      return () => window.clearTimeout(t);
    }
    if (beat === "unwrap") {
      const t = window.setTimeout(
        () => setBeat("reveal"),
        reduceMotion ? 180 : JOURNAL_GIFT_BEAT_MS.unwrap,
      );
      return () => window.clearTimeout(t);
    }
    if (beat === "reveal") {
      const t = window.setTimeout(() => {
        setBeat("admire");
        setBusy(false);
      }, reduceMotion ? 160 : JOURNAL_GIFT_BEAT_MS.reveal);
      return () => window.clearTimeout(t);
    }
  }, [beat, busy, reduceMotion]);

  const openJournal = useCallback(() => {
    if (beat !== "admire" || busy) return;
    setBusy(true);
    setBeat("opening");
  }, [beat, busy]);

  useEffect(() => {
    if (beat !== "opening") return;
    const ms = reduceMotion
      ? JOURNAL_REVEAL_OPENING_REDUCED_MS
      : JOURNAL_REVEAL_OPENING_MS;
    const t = window.setTimeout(() => {
      finish({ skipped: false, opened: true });
    }, ms);
    return () => window.clearTimeout(t);
  }, [beat, finish, reduceMotion]);

  const caption = CAPTIONS[beat];

  return (
    <div
      className="journal-gift-scene"
      data-testid="journal-reveal-flow"
      data-reveal-state={beat}
      data-first-creation={isFirstCreation ? "true" : "false"}
      role="region"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="sr-only">
        Spark has prepared a journal especially for you — {title}
      </h2>

      <button
        type="button"
        className="journal-gift-scene__skip"
        onClick={skipReveal}
        data-testid="journal-reveal-skip"
      >
        Skip reveal
      </button>

      <div className="journal-gift-scene__stage">
        {/* One physical gift for the whole ceremony — overlays change, not the object. */}
        <JournalGazeboWrappedGift
          config={journal}
          moment={beatToMoment(beat)}
          ribbonPull={ribbonPull}
          onJournalActivate={openJournal}
          interaction={
            <>
              {beat === "wrapped" ? (
                <button
                  type="button"
                  className="journal-gift-scene__hit journal-gift-scene__hit--overlay"
                  onClick={startRibbonPull}
                  aria-label={`Open your gift — ${title}`}
                  data-testid="journal-reveal-gift-button"
                />
              ) : null}
              {beat === "ribbon-pull" ? (
                <RibbonPullInteraction
                  disabled={busy}
                  onThresholdReached={onRibbonFreed}
                  onPullProgress={setRibbonPull}
                />
              ) : null}
            </>
          }
        />

        {(beat === "reveal" || beat === "admire") && !reduceMotion ? (
          <span className="journal-gift-scene__sparkles" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.span
                key={i}
                className="journal-gift-scene__spark"
                style={{
                  left: `${12 + (i * 11) % 76}%`,
                  top: `${18 + (i * 17) % 58}%`,
                }}
                animate={{ y: [0, -10, 0], opacity: [0.12, 0.7, 0.12] }}
                transition={{
                  duration: 2.8,
                  delay: i * 0.22,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {caption?.title ? (
          <motion.div
            key={beat}
            className="journal-gift-scene__caption"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <strong>{caption.title}</strong>
            {caption.sub ? <span>{caption.sub}</span> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
