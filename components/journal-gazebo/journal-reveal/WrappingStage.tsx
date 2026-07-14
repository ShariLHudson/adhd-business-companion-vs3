"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  JOURNAL_REVEAL_CREATING_MESSAGES,
  JOURNAL_REVEAL_MESSAGE_ROTATE_MS,
} from "@/lib/journalGazebo/journalRevealTypes";

type Props = {
  onReady: () => void;
  durationMs: number;
};

export function WrappingStage({ onReady, durationMs }: Props) {
  const reduceMotion = useReducedMotion();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const done = window.setTimeout(onReady, durationMs);
    return () => window.clearTimeout(done);
  }, [durationMs, onReady]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % JOURNAL_REVEAL_CREATING_MESSAGES.length);
    }, JOURNAL_REVEAL_MESSAGE_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const message = JOURNAL_REVEAL_CREATING_MESSAGES[messageIndex]!;

  return (
    <div className="journal-reveal__stage" data-testid="journal-reveal-wrapping">
      <motion.div
        className="journal-reveal__gift journal-reveal__gift--idle"
        initial={reduceMotion ? false : { scale: 0.86, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0.01 : 1.1, ease: "easeOut" }}
        aria-hidden="true"
      >
        {!reduceMotion ? (
          <motion.span
            className="journal-reveal__glow"
            animate={{ opacity: [0.35, 0.7, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <div className="journal-reveal__box">
          <motion.div
            className="journal-reveal__paper"
            initial={reduceMotion ? false : { scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 1.4 }}
          >
            <span className="journal-reveal__paper-sheen" />
          </motion.div>
          <motion.span
            className="journal-reveal__ribbon-h"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.55, duration: reduceMotion ? 0.01 : 0.7 }}
          />
          <motion.span
            className="journal-reveal__ribbon-v"
            initial={reduceMotion ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.85, duration: reduceMotion ? 0.01 : 0.7 }}
          />
          <motion.span
            className="journal-reveal__bow"
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 1.35, type: "spring", stiffness: 160 }}
          >
            <span className="journal-reveal__bow-loop journal-reveal__bow-loop--l" />
            <span className="journal-reveal__bow-loop journal-reveal__bow-loop--r" />
            <span className="journal-reveal__bow-knot" />
            <span className="journal-reveal__bow-tail journal-reveal__bow-tail--l" />
            <span className="journal-reveal__bow-tail journal-reveal__bow-tail--r" />
          </motion.span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          className="journal-reveal__message"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
