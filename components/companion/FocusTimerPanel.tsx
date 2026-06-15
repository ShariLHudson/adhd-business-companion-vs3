"use client";

import { useEffect, useState } from "react";

import {
  clampFocusMinutes,
  FOCUS_QUICK_PICKS,
  formatFocusDuration,
  loadPreferredFocusMinutes,
  savePreferredFocusMinutes,
} from "@/lib/focusDuration";
import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";

type Timer = ReturnType<typeof usePomodoroTimer>;

type FocusTimerPanelProps = {
  timer: Timer;
  onStartSession?: (minutes: number) => void;
  onAskShari?: () => void;
};

export function FocusTimerPanel({
  timer,
  onStartSession,
  onAskShari,
}: FocusTimerPanelProps) {
  const {
    minutes,
    setMinutes,
    running,
    isActive,
    isPaused,
    sessionLabel,
    displayMins,
    displaySecs,
    start,
    pause,
    reset,
  } = timer;

  const [customInput, setCustomInput] = useState(String(minutes));
  const [rememberDuration, setRememberDuration] = useState(true);

  useEffect(() => {
    const preferred = loadPreferredFocusMinutes();
    setMinutes(preferred);
    setCustomInput(String(preferred));
  }, [setMinutes]);

  useEffect(() => {
    if (!isActive) setCustomInput(String(minutes));
  }, [minutes, isActive]);

  function applyCustomMinutes() {
    const parsed = clampFocusMinutes(parseInt(customInput, 10));
    if (!Number.isFinite(parsed)) return;
    setMinutes(parsed);
    if (rememberDuration) savePreferredFocusMinutes(parsed);
  }

  function selectPreset(m: number) {
    setMinutes(m);
    setCustomInput(String(m));
    if (rememberDuration) savePreferredFocusMinutes(m);
  }

  function handleStart() {
    applyCustomMinutes();
    if (!isActive) onStartSession?.(clampFocusMinutes(minutes));
    start();
    if (rememberDuration) savePreferredFocusMinutes(minutes);
  }

  return (
    <div className="companion-fade-in mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <div className="flex w-full items-start justify-between gap-3">
        <div className="text-left">
          <p className="text-2xl font-semibold text-[#1f1c19]">Focus Timer</p>
          <p className="mt-2 text-lg leading-relaxed text-[#6b635a]">
            Any length works — pick a quick time or enter your own.
          </p>
        </div>
        {onAskShari ? (
          <button
            type="button"
            onClick={onAskShari}
            className="shrink-0 rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            Ask Shari
          </button>
        ) : null}
      </div>
      {isActive && (
        <p className="mt-1 text-base font-medium text-[#1e4f4f]">
          {sessionLabel}
        </p>
      )}

      <div className="presence-breathe mt-8 flex h-44 w-44 items-center justify-center rounded-full border-4 border-white shadow-xl">
        <p className="font-mono text-5xl font-semibold tabular-nums text-[#1e4f4f]">
          {String(displayMins).padStart(2, "0")}:
          {String(displaySecs).padStart(2, "0")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {FOCUS_QUICK_PICKS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={running}
            onClick={() => selectPreset(m)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-base ${
              minutes === m
                ? "bg-[#1e4f4f] text-white shadow-md"
                : "bg-white text-[#2d2926] shadow-sm hover:bg-[#f0f5f5]"
            } disabled:opacity-50`}
          >
            {formatFocusDuration(m)}
          </button>
        ))}
      </div>

      {!isActive && (
        <div className="mt-5 flex w-full max-w-xs flex-col items-stretch gap-3">
          <label className="flex flex-col gap-1.5 text-left text-sm font-semibold text-[#6b635a]">
            Custom minutes
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onBlur={applyCustomMinutes}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyCustomMinutes();
                }}
                className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                placeholder="e.g. 17"
              />
              <button
                type="button"
                onClick={applyCustomMinutes}
                className="shrink-0 rounded-lg border border-[#1e4f4f]/30 px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
              >
                Set
              </button>
            </div>
          </label>
          <label className="flex items-center justify-center gap-2 text-sm text-[#6b635a]">
            <input
              type="checkbox"
              checked={rememberDuration}
              onChange={(e) => setRememberDuration(e.target.checked)}
              className="h-4 w-4 rounded border-[#c9bfb0]"
            />
            Remember my preferred duration
          </label>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]"
          >
            {isPaused ? "Resume" : `Start ${formatFocusDuration(minutes)}`}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-8 py-3.5 text-lg font-semibold text-[#1e4f4f]"
          >
            Pause
          </button>
        )}
        {isActive && (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl px-6 py-3.5 text-lg font-medium text-[#6b635a] hover:bg-white/60"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
