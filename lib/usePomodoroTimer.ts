"use client";

import { useEffect, useState } from "react";

export const POMODORO_PRESETS = [15, 30, 60, 120, 180] as const;

export function usePomodoroTimer() {
  const [minutes, setMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      setRunning(false);
      setSecondsLeft(null);
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

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
    if (isPaused) {
      setRunning(true);
      return;
    }
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }

  // Start immediately at a specific duration (used when a Time Block launches
  // its linked Focus Session).
  function startWith(mins: number) {
    const m = Math.max(1, Math.round(mins));
    setMinutes(m);
    setSecondsLeft(m * 60);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(null);
  }

  return {
    minutes,
    setMinutes,
    secondsLeft,
    running,
    isActive,
    isPaused,
    sessionLabel,
    displayMins,
    displaySecs,
    start,
    startWith,
    pause,
    reset,
  };
}
