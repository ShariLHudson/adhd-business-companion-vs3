"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import { SceneRenderer } from "@/components/companion/scene/SceneRenderer";
import { createSceneState } from "@/lib/sceneRenderContract";
import {
  EVENING_HEARTH_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
  TIN_ROOF_RAIN_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";

type PhaseKind = "in" | "hold" | "out";
type BreathPhase = { kind: PhaseKind; seconds: number };
type Screen = "choice" | "customize" | "breathing" | "complete";
type SoundId = "off" | "rain" | "birds" | "water" | "fireplace" | "music";
type BreathCategory = "relaxing" | "energizing";

type Pattern = {
  id: string;
  name: string;
  tone: "calming" | "steady" | "reset";
  category?: BreathCategory;
  phases: BreathPhase[];
};

type Recommendation = {
  patternId: string;
  minutes: number;
  line: string;
};

type BreathePanelProps = {
  /** Leave without completing (choice screen / abandon). */
  onDone?: () => void;
  /** Continue Chat — return to conversation. */
  onContinueChat?: () => void;
  /** Resume previous activity — exact place they left. */
  onReturnPrevious?: () => void;
  /** Journal This — open Journal Gazebo. */
  onJournalThis?: () => void;
  /** Pre-select pattern from Universal Access phrase (e.g. box breathing). */
  initialPatternId?: string;
  /** Pre-select duration in minutes. */
  initialMinutes?: number;
  /** Peaceful place label — e.g. Peaceful Garden */
  environmentLabel?: string;
  /** When true, skip the choice screen and go straight to breathing (named pattern). */
  autoStart?: boolean;
};

const PHASE_LABEL: Record<PhaseKind, string> = {
  in: "Breathe In",
  hold: "Hold",
  out: "Breathe Out",
};

const PHASE_WORD: Record<PhaseKind, string> = {
  in: "Inhale",
  hold: "Hold",
  out: "Exhale",
};

const RELAXING_PATTERNS: Pattern[] = [
  {
    id: "gentle-reset",
    name: "Gentle Reset",
    tone: "calming",
    category: "relaxing",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "out", seconds: 6 },
    ],
  },
  {
    id: "deep-relaxation",
    name: "Deep Relaxation",
    tone: "reset",
    category: "relaxing",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "hold", seconds: 7 },
      { kind: "out", seconds: 8 },
    ],
  },
  {
    id: "evening-calm",
    name: "Evening Calm",
    tone: "calming",
    category: "relaxing",
    phases: [
      { kind: "in", seconds: 5 },
      { kind: "out", seconds: 5 },
    ],
  },
];

const ENERGIZING_PATTERNS: Pattern[] = [
  {
    id: "quick-wake",
    name: "Quick Wake",
    tone: "steady",
    category: "energizing",
    phases: [
      { kind: "in", seconds: 3 },
      { kind: "out", seconds: 3 },
    ],
  },
  {
    id: "power-breath",
    name: "Power Breath",
    tone: "steady",
    category: "energizing",
    phases: [
      { kind: "in", seconds: 6 },
      { kind: "out", seconds: 2 },
    ],
  },
  {
    id: "bright-start",
    name: "Bright Start",
    tone: "steady",
    category: "energizing",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "out", seconds: 2 },
    ],
  },
];

const NAMED_PATTERNS: Pattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    tone: "steady",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "hold", seconds: 4 },
      { kind: "out", seconds: 4 },
      { kind: "hold", seconds: 4 },
    ],
  },
  {
    id: "relax478",
    name: "4-7-8",
    tone: "reset",
    phases: [
      { kind: "in", seconds: 4 },
      { kind: "hold", seconds: 7 },
      { kind: "out", seconds: 8 },
    ],
  },
  {
    id: "equal",
    name: "Equal Breath",
    tone: "steady",
    phases: [
      { kind: "in", seconds: 5 },
      { kind: "out", seconds: 5 },
    ],
  },
];

const PATTERNS: Pattern[] = [
  ...RELAXING_PATTERNS,
  ...ENERGIZING_PATTERNS,
  ...NAMED_PATTERNS,
];

const RELAXING_DURATIONS = [0.5, 1, 3, 5] as const;
const ENERGIZING_DURATIONS = [0.5, 1] as const;

const SOUNDS: { id: SoundId; label: string; url: string | null }[] = [
  { id: "off", label: "Off", url: null },
  { id: "rain", label: "Soft Rain", url: TIN_ROOF_RAIN_AMBIENCE_MP3 },
  { id: "birds", label: "Birds", url: ORCHARD_BIRDS_AMBIENCE_MP3 },
  { id: "water", label: "Water", url: GAZEBO_JOURNAL_AMBIENCE_MP3 },
  { id: "fireplace", label: "Fireplace", url: EVENING_HEARTH_AMBIENCE_MP3 },
  { id: "music", label: "Spark Music", url: MUSIC_LOFT_AMBIENCE_MP3 },
];

const TIPS = [
  "Breathe through your nose when you can.",
  "Let your shoulders drop on the exhale.",
  "If you feel lightheaded, slow down or pause.",
  "There's no perfect breath — only this one.",
] as const;

const BREATH_CHOICES = [
  {
    id: "relaxing",
    title: "Relaxing Breath",
    purpose: "Calm, slow down, release tension.",
  },
  {
    id: "energizing",
    title: "Energizing Breath",
    purpose: "Increase energy, wake up, prepare for action.",
  },
] as const;

const DEFAULT_RELAXING_MINUTES = 1;
const DEFAULT_ENERGIZING_MINUTES = 0.5;

function normalizePatternId(patternId: string): string {
  if (patternId === "relaxing") return "gentle-reset";
  if (patternId === "energizing") return "quick-wake";
  return patternId;
}

function patternsForCategory(category: BreathCategory): Pattern[] {
  return category === "relaxing" ? RELAXING_PATTERNS : ENERGIZING_PATTERNS;
}

function durationsForCategory(category: BreathCategory): readonly number[] {
  return category === "relaxing" ? RELAXING_DURATIONS : ENERGIZING_DURATIONS;
}

function defaultMinutesForCategory(category: BreathCategory): number {
  return category === "relaxing"
    ? DEFAULT_RELAXING_MINUTES
    : DEFAULT_ENERGIZING_MINUTES;
}

function durationLabel(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)} seconds`;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function sessionLogLabel(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  return `${minutes} min`;
}

function recommendationForPattern(patternId: string): Recommendation {
  const resolved = normalizePatternId(patternId);
  const pattern = PATTERNS.find((p) => p.id === resolved);
  if (pattern?.category === "energizing") {
    return {
      patternId: resolved,
      minutes: DEFAULT_ENERGIZING_MINUTES,
      line: "I recommend a 30-second energizing breath.",
    };
  }
  if (patternId === "box") {
    return {
      patternId: "box",
      minutes: 2,
      line: "I recommend 2 minutes of Box Breathing.",
    };
  }
  if (patternId === "relax478") {
    return {
      patternId: "relax478",
      minutes: 2,
      line: "I recommend a 2-minute 4-7-8 breath.",
    };
  }
  if (patternId === "equal") {
    return {
      patternId: "equal",
      minutes: 2,
      line: "I recommend 2 minutes of Equal Breath.",
    };
  }
  return {
    patternId: resolved,
    minutes: DEFAULT_RELAXING_MINUTES,
    line: "I recommend a 1-minute calming breath.",
  };
}

function patternLine(p: Pattern): string {
  return p.phases
    .map((ph) => `${PHASE_WORD[ph.kind]} ${ph.seconds}s`)
    .join(" → ");
}

function phaseAt(phases: BreathPhase[], elapsedMs: number) {
  const cycleMs = phases.reduce((s, p) => s + p.seconds, 0) * 1000 || 1000;
  let t = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
  for (const p of phases) {
    const dur = p.seconds * 1000;
    if (t < dur) {
      return {
        phase: p,
        secondsLeft: Math.max(1, Math.ceil((dur - t) / 1000)),
      };
    }
    t -= dur;
  }
  const last = phases[phases.length - 1]!;
  return { phase: last, secondsLeft: last.seconds };
}

/** Smooth fullness 0→1 for circle scale across the cycle. */
function breathFullness(phases: BreathPhase[], elapsedMs: number): number {
  const cycleMs = phases.reduce((s, p) => s + p.seconds, 0) * 1000 || 1000;
  let t = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
  let entry = 0;
  for (const p of phases) {
    const dur = p.seconds * 1000;
    if (t <= dur) {
      const prog = dur ? t / dur : 1;
      const eased = prog * prog * (3 - 2 * prog);
      if (p.kind === "in") return entry + (1 - entry) * eased;
      if (p.kind === "out") return entry * (1 - eased);
      return entry;
    }
    if (p.kind === "in") entry = 1;
    else if (p.kind === "out") entry = 0;
    t -= dur;
  }
  return entry;
}

export function BreathePanel({
  onDone,
  onContinueChat,
  onReturnPrevious,
  onJournalThis,
  initialPatternId,
  initialMinutes,
  environmentLabel = "Peaceful Garden",
  autoStart = false,
}: BreathePanelProps) {
  const recommendation = recommendationForPattern(
    initialPatternId ?? "gentle-reset",
  );
  const seededPattern = recommendation.patternId;
  const seededMinutes = initialMinutes ?? recommendation.minutes;
  const [screen, setScreen] = useState<Screen>(
    autoStart ? "breathing" : "choice",
  );
  const [breathCategory, setBreathCategory] = useState<BreathCategory | null>(
    null,
  );
  const [patternId, setPatternId] = useState(seededPattern);
  const [minutes, setMinutes] = useState(seededMinutes);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundId, setSoundId] = useState<SoundId>("off");
  const [showTips, setShowTips] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const pattern = PATTERNS.find((p) => p.id === patternId) ?? PATTERNS[0]!;
  const customizePatterns = breathCategory
    ? patternsForCategory(breathCategory)
    : PATTERNS;
  const durationOptions = breathCategory
    ? durationsForCategory(breathCategory)
    : RELAXING_DURATIONS;
  const sessionMs = minutes * 60 * 1000;
  const breathing = screen === "breathing";

  function stopAudio() {
    audioRef.current?.pause();
  }

  function finishSession() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    stopAudio();
    setShowTips(false);
    setScreen("complete");
    logMomentum("reset", "Breathing session completed");
  }

  useEffect(() => {
    if (!breathing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      return;
    }
    completedRef.current = false;
    startRef.current = performance.now();
    setElapsedMs(0);
    const tick = (now: number) => {
      if (startRef.current == null) return;
      const next = now - startRef.current;
      setElapsedMs(next);
      if (next >= sessionMs) {
        if (!completedRef.current) {
          completedRef.current = true;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          startRef.current = null;
          audioRef.current?.pause();
          setShowTips(false);
          setScreen("complete");
          logMomentum("reset", "Breathing session completed");
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [breathing, patternId, sessionMs]);

  useEffect(() => {
    const sound = SOUNDS.find((s) => s.id === soundId);
    const url = sound?.url ?? null;
    if (!url) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.src = "";
      return;
    }
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = 0.45;
    if (audio.src !== new URL(url, window.location.origin).href) {
      audio.src = url;
    }
    if (breathing) {
      void audio.play().catch(() => {
        /* autoplay may be blocked until gesture */
      });
    } else {
      audio.pause();
    }
    return () => {
      audio.pause();
    };
  }, [soundId, breathing]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const { phase, secondsLeft } = useMemo(
    () => phaseAt(pattern.phases, elapsedMs),
    [pattern.phases, elapsedMs],
  );
  const fullness = breathing
    ? breathFullness(pattern.phases, elapsedMs)
    : screen === "complete"
      ? 0.72
      : 0.55;
  const orbScale = 0.62 + 0.38 * fullness;

  function startChoice(choiceId: string) {
    const category = choiceId as BreathCategory;
    const defaultPattern = patternsForCategory(category)[0]!;
    const defaultMinutes = defaultMinutesForCategory(category);
    setBreathCategory(category);
    setPatternId(defaultPattern.id);
    setMinutes(defaultMinutes);
    setScreen("customize");
  }

  function beginBreathing(nextPatternId = patternId, nextMinutes = minutes) {
    const resolvedId = normalizePatternId(nextPatternId);
    setPatternId(resolvedId);
    setMinutes(nextMinutes);
    setElapsedMs(0);
    setShowTips(false);
    setScreen("breathing");
    logMomentum(
      "start",
      `Breathing — ${sessionLogLabel(nextMinutes)} (${PATTERNS.find((p) => p.id === resolvedId)?.name ?? resolvedId})`,
    );
    const sound = SOUNDS.find((s) => s.id === soundId);
    if (sound?.url && audioRef.current) {
      void audioRef.current.play().catch(() => undefined);
    }
  }

  function endEarly() {
    if (screen === "breathing") {
      finishSession();
      return;
    }
    stopAudio();
    onDone?.();
  }

  function startAnother() {
    stopAudio();
    setElapsedMs(0);
    setShowTips(false);
    setBreathCategory(null);
    setScreen("choice");
  }

  return (
    <SceneRenderer
      scene={createSceneState({ workspaceId: "breathe", seed: "breathe" })}
      className="h-full min-h-0"
      hideHeader
      immersive
    >
      <div
        className={`breathe-estate breathe-estate--${screen}`}
        data-testid="breathe-estate"
        data-breathe-screen={screen}
      >
        <header className="breathe-estate__top">
          <div className="breathe-estate__brand">
            <p className="breathe-estate__brand-kicker">Spark Estate</p>
            <p className="breathe-estate__brand-title">Breathe</p>
            <p className="breathe-estate__brand-place">{environmentLabel}</p>
          </div>
          <div className="breathe-estate__top-actions">
          {screen !== "complete" ? (
            <button
              type="button"
              className="breathe-estate__ghost"
              onClick={endEarly}
              data-testid="breathe-end-session"
            >
              {screen === "breathing" ? "End Session" : "Leave"}
            </button>
          ) : (
            <span />
          )}
          </div>
        </header>

        {showTips && screen === "breathing" ? (
          <div
            className="breathe-estate__sheet breathe-estate__sheet--tips"
            role="dialog"
          >
            <p className="breathe-estate__sheet-title">Tips</p>
            <ul className="breathe-estate__tips">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <button
              type="button"
              className="breathe-estate__ghost"
              onClick={() => setShowTips(false)}
            >
              Close
            </button>
          </div>
        ) : null}

        {screen === "choice" ? (
          <div className="breathe-estate__center breathe-estate__choice">
            <div className="breathe-estate-orb-wrap" aria-hidden="true">
              <div
                className="breathe-estate-orb-glow"
                style={{ transform: `scale(${orbScale})` }}
              />
              <div
                className="breathe-estate-orb breathe-estate-orb--idle"
                style={{ transform: `scale(${orbScale})` }}
              />
            </div>
            <p className="breathe-estate__choice-prompt" data-testid="breathe-choice-prompt">
              What does your mind need right now?
            </p>
            <div className="breathe-estate__choice-list">
              {BREATH_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="breathe-estate__choice-card"
                  onClick={() => startChoice(choice.id)}
                  data-testid={`breathe-choice-${choice.id}`}
                >
                  <span className="breathe-estate__choice-title">{choice.title}</span>
                  <span className="breathe-estate__choice-purpose">{choice.purpose}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {screen === "customize" ? (
          <div className="breathe-estate__center breathe-estate__customize">
            <p className="breathe-estate__customize-title">
              {breathCategory === "energizing"
                ? "Energizing Breath"
                : "Relaxing Breath"}
            </p>
            <label className="breathe-estate__field">
              <span>Style</span>
              <select
                value={pattern.id}
                onChange={(e) => setPatternId(e.target.value)}
                data-testid="breathe-pattern"
              >
                {customizePatterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="breathe-estate__sequence">{patternLine(pattern)}</p>
            <label className="breathe-estate__field">
              <span>Length</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                data-testid="breathe-duration"
              >
                {durationOptions.map((m) => (
                  <option key={m} value={m}>
                    {durationLabel(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="breathe-estate__field">
              <span>Sound</span>
              <select
                value={soundId}
                onChange={(e) => setSoundId(e.target.value as SoundId)}
                data-testid="breathe-sound"
              >
                {SOUNDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="breathe-estate__recommend-actions">
              <button
                type="button"
                className="breathe-estate__primary"
                onClick={() => beginBreathing()}
                data-testid="breathe-start-custom"
              >
                Start
              </button>
              <button
                type="button"
                className="breathe-estate__ghost"
                onClick={() => {
                  setBreathCategory(null);
                  setScreen("choice");
                }}
              >
                Back
              </button>
            </div>
          </div>
        ) : null}

        {screen === "breathing" ? (
          <>
            <div className="breathe-estate__center">
              <div className="breathe-estate-orb-wrap" aria-live="polite">
                <div
                  className="breathe-estate-orb-glow"
                  style={{ transform: `scale(${orbScale})` }}
                />
                <div
                  className="breathe-estate-orb"
                  style={{ transform: `scale(${orbScale})` }}
                >
                  <p className="breathe-estate-orb__label">
                    {PHASE_LABEL[phase.kind]}
                  </p>
                  <p className="breathe-estate-orb__count">{secondsLeft}</p>
                </div>
              </div>
            </div>

            <div className="breathe-estate__bottom breathe-estate__bottom--session">
              <p className="breathe-estate__sequence breathe-estate__sequence--live">
                {patternLine(pattern)}
              </p>
              <div className="breathe-estate__controls-row">
                <label className="breathe-estate__sound">
                  <span className="sr-only">Sound</span>
                  <select
                    value={soundId}
                    onChange={(e) => setSoundId(e.target.value as SoundId)}
                    data-testid="breathe-sound-live"
                  >
                    {SOUNDS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="breathe-estate__ghost breathe-estate__tips-btn"
                  onClick={() => setShowTips((v) => !v)}
                  data-testid="breathe-tips"
                >
                  Tips
                </button>
              </div>
            </div>
          </>
        ) : null}

        {screen === "complete" ? (
          <div className="breathe-estate__center breathe-estate__complete">
            <div className="breathe-estate-orb-wrap" aria-hidden="true">
              <div
                className="breathe-estate-orb-glow"
                style={{ transform: `scale(${orbScale})` }}
              />
              <div
                className="breathe-estate-orb breathe-estate-orb--idle"
                style={{ transform: `scale(${orbScale})` }}
              />
            </div>
            <p className="breathe-estate__complete-title" data-testid="breathe-complete">
              Nice work.
            </p>
            <p className="breathe-estate__complete-copy">
              Take a moment to notice how you feel.
            </p>
            <div className="breathe-estate__complete-actions">
              <button
                type="button"
                className="breathe-estate__primary"
                onClick={() => (onReturnPrevious ?? onDone)?.()}
                data-testid="breathe-return-previous"
              >
                Resume previous activity
              </button>
              <button
                type="button"
                className="breathe-estate__ghost"
                onClick={() => (onContinueChat ?? onDone)?.()}
                data-testid="breathe-continue-chat"
              >
                Continue Chat
              </button>
              <button
                type="button"
                className="breathe-estate__ghost"
                onClick={() => onJournalThis?.()}
                data-testid="breathe-journal"
              >
                Journal
              </button>
              <button
                type="button"
                className="breathe-estate__ghost"
                onClick={startAnother}
                data-testid="breathe-another"
              >
                Another Session
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </SceneRenderer>
  );
}
