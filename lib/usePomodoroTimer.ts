"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playFocusComplete, unlockChime } from "@/lib/chime";
import { loadPreferredFocusMinutes, clampFocusMinutes } from "@/lib/focusDuration";
import type { FocusSessionSetup } from "@/lib/focusSession";

export const POMODORO_PRESETS = [5, 10, 12, 15, 20, 25, 30, 45, 60, 90] as const;

export type FocusDebriefSnapshot = FocusSessionSetup & {
  completedMinutes: number;
};

export function usePomodoroTimer() {
  const [minutes, setMinutesState] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [sessionMeta, setSessionMeta] = useState<FocusSessionSetup | null>(null);
  const [debriefPending, setDebriefPending] = useState<FocusDebriefSnapshot | null>(
    null,
  );
  const metaRef = useRef(sessionMeta);
  metaRef.current = sessionMeta;

  useEffect(() => {
    setMinutesState(loadPreferredFocusMinutes());
  }, []);

  useEffect(() => {
    if (!running || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setRunning(false);
      const completedMinutes = minutes;
      const completedLabel = label;
      const snap = metaRef.current;
      if (snap) {
        setDebriefPending({
          ...snap,
          completedMinutes,
        });
      } else if (completedLabel?.trim()) {
        setDebriefPending({
          focusItem: completedLabel.trim(),
          doneEnough: "Used the full focus block",
          prepNote: "",
          minutes: completedMinutes,
          completedMinutes,
        });
      }
      setSecondsLeft(null);
      setLabel(null);
      setSessionMeta(null);
      playFocusComplete();
      void import("@/lib/ecosystem/eventTrackingEngine").then(
        ({ trackEcosystemEvent }) => {
          const fromTimeBlock = Boolean(completedLabel?.trim());
          trackEcosystemEvent({
            eventType: fromTimeBlock
              ? "feature.time_block_completed"
              : "feature.focus_audio_completed",
            feature: fromTimeBlock ? "time-block" : "focus-audio",
            metadata: {
              actualMinutes: completedMinutes,
              timed: true,
            },
          });
        },
      );
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, secondsLeft, minutes, label]);

  const isActive = secondsLeft !== null;
  const isPaused = isActive && !running;

  const sessionLabel = running
    ? "In session"
    : isPaused
      ? "Paused"
      : "Ready";

  const displayMins =
    secondsLeft !== null ? Math.floor(secondsLeft / 60) : minutes;
  const displaySecs = secondsLeft !== null ? secondsLeft % 60 : 0;

  const setMinutes = useCallback((value: number) => {
    setMinutesState(clampFocusMinutes(value));
  }, []);

  function start() {
    unlockChime();
    if (isPaused) {
      setRunning(true);
      return;
    }
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }

  function startWith(mins: number, taskLabel?: string) {
    unlockChime();
    const m = Math.max(1, Math.round(mins));
    setMinutes(m);
    setLabel(taskLabel?.trim() || null);
    setSessionMeta(null);
    setDebriefPending(null);
    setSecondsLeft(m * 60);
    setRunning(true);
  }

  function startGuidedSession(setup: FocusSessionSetup) {
    unlockChime();
    const m = clampFocusMinutes(setup.minutes);
    setMinutes(m);
    setLabel(setup.focusItem.trim());
    setSessionMeta(setup);
    setDebriefPending(null);
    setSecondsLeft(m * 60);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(null);
    setLabel(null);
    setSessionMeta(null);
  }

  function clearDebrief() {
    setDebriefPending(null);
  }

  return {
    minutes,
    setMinutes,
    secondsLeft,
    running,
    isActive,
    isPaused,
    sessionLabel,
    label,
    sessionMeta,
    debriefPending,
    displayMins,
    displaySecs,
    start,
    startWith,
    startGuidedSession,
    pause,
    reset,
    clearDebrief,
  };
}
