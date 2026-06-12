"use client";

import { useEffect, useState } from "react";
import { playFocusComplete, unlockChime } from "@/lib/chime";

export const POMODORO_PRESETS = [15, 30, 60, 120, 180] as const;

export function usePomodoroTimer() {
  const [minutes, setMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  // What the session is FOR (e.g. a time block / task name) — shown in the
  // global Focus Active bar so the user remembers what they were working on.
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!running || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setRunning(false);
      const completedMinutes = minutes;
      const completedLabel = label;
      setSecondsLeft(null);
      playFocusComplete(); // a distinct rising arpeggio = "focus session done"
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

  function start() {
    unlockChime(); // user gesture — lets the end chime play later
    if (isPaused) {
      setRunning(true);
      return;
    }
    setLabel(null);
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }

  // Start immediately at a specific duration (used when a Time Block launches
  // its linked Focus Session). An optional label names the task.
  function startWith(mins: number, taskLabel?: string) {
    unlockChime();
    const m = Math.max(1, Math.round(mins));
    setMinutes(m);
    setLabel(taskLabel?.trim() || null);
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
    displayMins,
    displaySecs,
    start,
    startWith,
    pause,
    reset,
  };
}
