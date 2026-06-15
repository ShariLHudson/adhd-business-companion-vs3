"use client";

import { useEffect, useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import { SceneBackground } from "./SceneBackground";

type PhaseKind = "in" | "hold" | "out";
type BreathPhase = { kind: PhaseKind; seconds: number };
type Mode = "calm" | "energize";

type Pattern = {
  id: string;
  name: string;
  description: string;
  mode: Mode;
  phases: BreathPhase[];
};

const PHASE_LABEL: Record<PhaseKind, string> = {
  in: "Breathe in…",
  hold: "Hold…",
  out: "Breathe out…",
};

const PHASE_WORD: Record<PhaseKind, string> = {
  in: "Inhale",
  hold: "Hold",
  out: "Exhale",
};

const PATTERNS: Pattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal counts all around — great for anxiety or overwhelm.",
    mode: "calm",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "hold", seconds: 4 },
      { kind: "out", seconds: 4 },
      { kind: "hold", seconds: 4 },
    ],
  },
  {
    id: "relax478",
    name: "4-7-8 Relax",
    description: "A long exhale to calm your nervous system before rest.",
    mode: "calm",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "hold", seconds: 7 },
      { kind: "out", seconds: 8 },
    ],
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "Steady five and five to find your center.",
    mode: "calm",
    phases: [
      { kind: "in", seconds: 5 },
      { kind: "out", seconds: 5 },
    ],
  },
  {
    id: "calm",
    name: "Calm (Extended Exhale)",
    description: "A gentle longer exhale to settle and slow down.",
    mode: "calm",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "out", seconds: 6 },
    ],
  },
  {
    id: "belly",
    name: "Belly Breathing",
    description: "Deep diaphragmatic breaths down into your belly.",
    mode: "calm",
    phases: [
      { kind: "in", seconds: 5 },
      { kind: "hold", seconds: 2 },
      { kind: "out", seconds: 5 },
    ],
  },
  {
    id: "energize",
    name: "Energizing Breath",
    description: "Bigger inhale, quick exhale — a light, quick wake-up.",
    mode: "energize",
    phases: [
      { kind: "in", seconds: 6 },
      { kind: "out", seconds: 2 },
    ],
  },
];

// Calm can run long; Energize stays short on purpose — longer fast breathing
// can cause lightheadedness, so we cap it at 1 minute.
const LENGTHS_BY_MODE: Record<Mode, number[]> = {
  calm: [1, 5, 10],
  energize: [0.5, 1],
};

function lengthLabel(m: number): string {
  return m < 1 ? `${Math.round(m * 60)} sec` : `${m} min`;
}

function patternLine(p: Pattern): string {
  return p.phases.map((ph) => `${PHASE_WORD[ph.kind]} ${ph.seconds}s`).join(" → ");
}

type BreathTheme = "calm" | "focus" | "recovery" | "grounding" | "energize";

function breathTheme(mode: Mode, patternId: string): BreathTheme {
  if (mode === "energize") return "energize";
  if (patternId === "relax478" || patternId === "calm" || patternId === "belly") {
    return "recovery";
  }
  if (patternId === "coherent") return "grounding";
  if (patternId === "box") return "focus";
  return "calm";
}

function phaseAt(phases: BreathPhase[], elapsed: number) {
  const cycleLen = phases.reduce((s, p) => s + p.seconds, 0) || 1;
  let t = elapsed % cycleLen;
  for (const p of phases) {
    if (t < p.seconds) return { phase: p, secondsLeft: p.seconds - t };
    t -= p.seconds;
  }
  const last = phases[phases.length - 1]!;
  return { phase: last, secondsLeft: last.seconds };
}

function breathFullness(phases: BreathPhase[], x: number): number {
  const cycleLen = phases.reduce((s, p) => s + p.seconds, 0) || 1;
  let t = ((x % cycleLen) + cycleLen) % cycleLen;
  let entry = 0;
  for (const p of phases) {
    if (t <= p.seconds) {
      const prog = p.seconds ? t / p.seconds : 1;
      if (p.kind === "in") return entry + (1 - entry) * prog;
      if (p.kind === "out") return entry * (1 - prog);
      return entry;
    }
    if (p.kind === "in") entry = 1;
    else if (p.kind === "out") entry = 0;
    t -= p.seconds;
  }
  return entry;
}

export function BreathePanel({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<Mode>("calm");
  const [patternId, setPatternId] = useState<string>("box");
  const [minutes, setMinutes] = useState<number>(5);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const modePatterns = PATTERNS.filter((p) => p.mode === mode);
  const pattern =
    modePatterns.find((p) => p.id === patternId) ?? modePatterns[0]!;
  const lengths = LENGTHS_BY_MODE[mode];
  const total = minutes * 60;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (active && elapsed >= total) {
      setActive(false);
      setCompleted(true);
      logMomentum("reset", "Breathing reset");
    }
  }, [active, elapsed, total]);

  function reset() {
    setActive(false);
    setCompleted(false);
    setElapsed(0);
  }

  function changeMode(m: Mode) {
    setMode(m);
    const first = PATTERNS.find((p) => p.mode === m)!;
    setPatternId(first.id);
    // Energize is capped — default to the shortest safe length.
    setMinutes(m === "energize" ? 0.5 : 5);
    reset();
  }

  function start() {
    setElapsed(0);
    setCompleted(false);
    setActive(true);
  }

  const { phase, secondsLeft } = phaseAt(pattern.phases, elapsed);
  const fullness = active ? breathFullness(pattern.phases, elapsed + 1) : 0.6;
  const orbScale = 0.55 + 0.45 * fullness;
  const theme = breathTheme(mode, pattern.id);

  const remaining = Math.max(0, total - elapsed);
  const timeLabel = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  const modeBtn = (m: Mode, label: string) =>
    `flex-1 rounded-xl border px-3 py-2.5 text-base font-bold transition-colors ${
      mode === m
        ? "border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-sm"
        : "border-[#c9bfb0] bg-white/80 text-[#3d3630] hover:bg-white"
    }`;

  return (
    <div className="companion-fade-in relative h-full overflow-y-auto px-4 py-8 sm:px-6">
      <SceneBackground page="progress" seed="breathe" />
      <div className="relative mx-auto w-full max-w-xl">
        {/* Large content area on a readable card over the scene — a sister
            layout to Focus Audio (same width, spacing, immersive feel). */}
        <div className="flex flex-col items-center rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8">
        {/* Primary */}
        <p className="text-4xl font-bold text-[#1f1c19]">Breathe</p>
        {/* Secondary */}
        <p className="mt-2 text-lg leading-relaxed text-[#4b463f]">
          Pick a pattern and length — energizing breaths stay under 1 minute to
          keep it safe and light.
        </p>

        {/* Mode */}
        <div className="mt-6 flex w-full gap-2">
          <button type="button" onClick={() => changeMode("calm")} className={modeBtn("calm", "")}>
            🟢 Calm
          </button>
          <button
            type="button"
            onClick={() => changeMode("energize")}
            className={modeBtn("energize", "")}
          >
            🔵 Energize
          </button>
        </div>

        {/* Session length */}
        <div className="mt-5 w-full">
          <p className="mb-2 text-left text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Session length
          </p>
          <div className="flex gap-2">
            {lengths.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMinutes(m);
                  reset();
                }}
                className={`flex-1 rounded-xl border px-3 py-3 text-base font-bold transition-colors ${
                  minutes === m
                    ? "border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-sm"
                    : "border-[#c9bfb0] bg-white/80 text-[#3d3630] hover:bg-white"
                }`}
              >
                {lengthLabel(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Breathing pattern */}
        <div className="mt-5 w-full">
          <p className="mb-2 text-left text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Breathing pattern
          </p>
          <select
            value={pattern.id}
            onChange={(e) => {
              setPatternId(e.target.value);
              reset();
            }}
            className="w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-3 text-lg font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            {modePatterns.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {/* Secondary */}
          <p className="mt-2 text-left text-base text-[#4b463f]">
            {pattern.description}
          </p>
          {/* Guidance — small but readable */}
          <p className="mt-1 text-left text-base font-semibold text-[#1e4f4f]">
            {patternLine(pattern)}
          </p>
        </div>

        {/* Breathing circle */}
        <div className="breathe-orb-wrap">
          <div
            className={`breathe-orb-pulse breathe-orb-pulse--${theme}`}
            style={{
              transform: `scale(${orbScale})`,
              transition: active
                ? "transform 1000ms linear"
                : "transform 600ms ease-out",
            }}
          />
          <div
            className={`breathe-orb breathe-orb--${theme}`}
            style={{
              transform: `scale(${orbScale})`,
              transitionProperty: "transform",
              transitionTimingFunction: active ? "linear" : "ease-out",
              transitionDuration: active ? "1000ms" : "600ms",
            }}
          >
            <div>
              <p className="breathe-orb-label text-2xl font-bold">
                {active
                  ? PHASE_LABEL[phase.kind]
                  : completed
                    ? "Nicely done"
                    : "Ready"}
              </p>
              {active && (
                <p className="breathe-orb-count mt-1 font-mono text-5xl font-bold tabular-nums">
                  {secondsLeft}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 h-6 text-lg text-[#4b463f]">
          {active ? `${timeLabel} left` : completed ? "That's your reset." : ""}
        </p>

        {/* Controls */}
        <div className="mt-4 flex gap-3">
          {!active ? (
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-[#1e4f4f] px-8 py-3.5 text-xl font-bold text-white shadow-md hover:bg-[#163a3a]"
            >
              {completed ? "Breathe again" : "Start"}
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-8 py-3.5 text-xl font-bold text-[#1e4f4f]"
            >
              Stop
            </button>
          )}
          {completed && !active && onDone && (
            <button
              type="button"
              onClick={() => onDone()}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-8 py-3.5 text-xl font-bold text-[#1e4f4f]"
            >
              Done
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
