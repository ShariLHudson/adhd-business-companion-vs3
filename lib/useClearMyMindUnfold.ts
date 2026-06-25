"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLEAR_MY_MIND_UNFOLD_DELAYS,
  maxUnfoldStep,
  type ClearMyMindUnfoldStep,
} from "@/lib/clearMyMindUnfold";

const ADVANCE_STEPS: Exclude<ClearMyMindUnfoldStep, "idle">[] = [
  "received",
  "reflecting",
  "holding",
  "connections",
  "patterns",
  "possibility",
];

/**
 * Gradually unfolds clarity after Share — never jumps to results.
 */
export function useClearMyMindUnfold(
  holdAck: string | null,
  itemCount: number,
) {
  const [step, setStep] = useState<ClearMyMindUnfoldStep>("idle");
  const stepRef = useRef<ClearMyMindUnfoldStep>("idle");
  const timersRef = useRef<number[]>([]);

  const advanceTo = useCallback((next: ClearMyMindUnfoldStep) => {
    setStep((prev) => {
      const merged = maxUnfoldStep(prev, next);
      stepRef.current = merged;
      return merged;
    });
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const scheduleUnfold = useCallback(() => {
    clearTimers();
    advanceTo("received");

    for (const target of ADVANCE_STEPS) {
      if (target === "received") continue;
      const delay = CLEAR_MY_MIND_UNFOLD_DELAYS[target];
      const id = window.setTimeout(() => {
        advanceTo(target);
      }, delay);
      timersRef.current.push(id);
    }
  }, [advanceTo, clearTimers]);

  useEffect(() => {
    if (!holdAck || itemCount === 0) {
      if (!holdAck) {
        clearTimers();
        stepRef.current = "idle";
        setStep("idle");
      }
      return;
    }

    scheduleUnfold();
    return clearTimers;
  }, [holdAck, itemCount, scheduleUnfold, clearTimers]);

  const accelerateToPatterns = useCallback(() => {
    clearTimers();
    advanceTo("patterns");
    window.setTimeout(() => advanceTo("possibility"), 1200);
  }, [advanceTo, clearTimers]);

  return { step, stepRef, accelerateToPatterns, advanceTo };
}
