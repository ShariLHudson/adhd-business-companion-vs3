"use client";

import { POMODORO_PRESETS } from "@/lib/usePomodoroTimer";
import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";

type Timer = ReturnType<typeof usePomodoroTimer>;

type FocusTimerPanelProps = {
  timer: Timer;
  onStartSession?: (minutes: number) => void;
};

const MINUTE_STEPS = [0, 15, 30, 45];

function presetLabel(m: number) {
  return m % 60 === 0 ? `${m / 60} hr` : `${m} min`;
}

export function FocusTimerPanel({ timer, onStartSession }: FocusTimerPanelProps) {
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

  const hrs = Math.floor(minutes / 60);
  const mins = MINUTE_STEPS.includes(minutes % 60) ? minutes % 60 : 0;

  function setHM(h: number, m: number) {
    setMinutes(Math.max(1, h * 60 + m));
  }

  function handleStart() {
    if (!isActive) onStartSession?.(minutes);
    start();
  }

  const selectClass =
    "mt-1 rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  return (
    <div className="companion-fade-in mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      <p className="text-2xl font-semibold text-[#1f1c19]">Focus Timer</p>
      <p className="mt-2 text-lg leading-relaxed text-[#6b635a]">
        One block of calm, focused time. Pick what feels right.
      </p>
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

      {/* Quick select */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {POMODORO_PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={running}
            onClick={() => setMinutes(m)}
            className={`rounded-full px-5 py-2.5 text-base font-semibold transition-all ${
              minutes === m
                ? "bg-[#1e4f4f] text-white shadow-md"
                : "bg-white text-[#2d2926] shadow-sm hover:bg-[#f0f5f5]"
            } disabled:opacity-50`}
          >
            {presetLabel(m)}
          </button>
        ))}
      </div>

      {/* Custom hours + minutes */}
      {!isActive && (
        <div className="mt-5 flex items-end justify-center gap-3">
          <label className="flex flex-col items-start text-sm font-semibold text-[#6b635a]">
            Hours
            <select
              value={hrs}
              onChange={(e) => setHM(Number(e.target.value), mins)}
              className={selectClass}
            >
              {Array.from({ length: 9 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col items-start text-sm font-semibold text-[#6b635a]">
            Minutes
            <select
              value={mins}
              onChange={(e) => setHM(hrs, Number(e.target.value))}
              className={selectClass}
            >
              {MINUTE_STEPS.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
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
            {isPaused ? "Resume" : "Start focus"}
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
