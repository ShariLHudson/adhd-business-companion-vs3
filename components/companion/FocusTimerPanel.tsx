"use client";

import { useEffect, useState } from "react";

import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  clampFocusMinutes,
  FOCUS_QUICK_PICKS,
  formatFocusDuration,
  loadPreferredFocusMinutes,
  savePreferredFocusMinutes,
} from "@/lib/focusDuration";
import {
  FOCUS_DEBRIEF_OPTIONS,
  FOCUS_SETUP_STEPS,
  focusDebriefMessage,
  type FocusDebriefOutcome,
  type FocusSessionSetup,
} from "@/lib/focusSession";
import type { usePomodoroTimer } from "@/lib/usePomodoroTimer";

type Timer = ReturnType<typeof usePomodoroTimer>;

type FocusTimerPanelProps = {
  timer: Timer;
  onStartSession?: (minutes: number) => void;
  onSessionStarted?: (setup: FocusSessionSetup) => void;
  onAskShari?: () => void;
  onDebrief?: (outcome: FocusDebriefOutcome, snapshot: Timer["debriefPending"]) => void;
};

export function FocusTimerPanel({
  timer,
  onStartSession,
  onSessionStarted,
  onAskShari,
  onDebrief,
}: FocusTimerPanelProps) {
  const {
    isActive,
    isPaused,
    running,
    displayMins,
    displaySecs,
    sessionMeta,
    debriefPending,
    startGuidedSession,
    pause,
    start,
    reset,
    clearDebrief,
  } = timer;

  const [stepIndex, setStepIndex] = useState(0);
  const [focusItem, setFocusItem] = useState("");
  const [doneEnough, setDoneEnough] = useState("");
  const [prepNote, setPrepNote] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState(loadPreferredFocusMinutes());
  const [customInput, setCustomInput] = useState(String(selectedMinutes));
  const [rememberDuration, setRememberDuration] = useState(true);
  const [debriefThanks, setDebriefThanks] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive && !debriefPending) {
      setStepIndex(0);
      setDebriefThanks(null);
    }
  }, [isActive, debriefPending]);

  const step = FOCUS_SETUP_STEPS[stepIndex];
  const showSetup = !isActive && !debriefPending && !debriefThanks;
  const showActive = isActive && !debriefPending;
  const showDebrief = Boolean(debriefPending) && !debriefThanks;

  function applyCustomMinutes() {
    const parsed = clampFocusMinutes(parseInt(customInput, 10));
    if (!Number.isFinite(parsed)) return;
    setSelectedMinutes(parsed);
    setCustomInput(String(parsed));
  }

  function selectPreset(m: number) {
    setSelectedMinutes(m);
    setCustomInput(String(m));
  }

  function advanceStep() {
    if (stepIndex < FOCUS_SETUP_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    beginSession();
  }

  function canAdvance(): boolean {
    if (step?.id === "focus") return focusItem.trim().length > 0;
    if (step?.id === "done-enough") return doneEnough.trim().length > 0;
    if (step?.id === "prep") return true;
    if (step?.id === "duration") return selectedMinutes >= 1;
    return false;
  }

  function beginSession() {
    const mins = clampFocusMinutes(selectedMinutes);
    if (rememberDuration) savePreferredFocusMinutes(mins);
    const setup: FocusSessionSetup = {
      focusItem: focusItem.trim(),
      doneEnough: doneEnough.trim(),
      prepNote: prepNote.trim() || "Ready to go",
      minutes: mins,
    };
    startGuidedSession(setup);
    onStartSession?.(mins);
    onSessionStarted?.(setup);
  }

  function handleDebrief(outcome: FocusDebriefOutcome) {
    if (!debriefPending) return;
    setDebriefThanks(focusDebriefMessage(outcome));
    onDebrief?.(outcome, debriefPending);
    clearDebrief();
    if (outcome === "stuck") onAskShari?.();
    if (outcome === "another-round") {
      setStepIndex(FOCUS_SETUP_STEPS.length - 1);
      setDebriefThanks(null);
    }
  }

  const timeDisplay = `${String(displayMins).padStart(2, "0")}:${String(displaySecs).padStart(2, "0")}`;

  if (showDebrief && debriefPending) {
    return (
      <div className="companion-fade-in mx-auto flex max-w-xl flex-col px-6 py-10">
        <p className="text-2xl font-semibold text-[#1f1c19]">How did it go?</p>
        <p className="mt-2 text-base text-[#6b635a]">
          You focused on{" "}
          <span className="font-semibold text-[#1f1c19]">
            {debriefPending.focusItem}
          </span>
          .
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {FOCUS_DEBRIEF_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleDebrief(opt.id)}
              className="rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-left text-base font-semibold text-[#1f1c19] transition-colors hover:border-[#1e4f4f]/40 hover:bg-[#f0f5f5]"
            >
              <span aria-hidden="true">{opt.emoji} </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (debriefThanks) {
    return (
      <div className="companion-fade-in mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
        <p className="text-xl font-semibold text-[#1f1c19]">{debriefThanks}</p>
        <button
          type="button"
          onClick={() => {
            setDebriefThanks(null);
            setStepIndex(0);
          }}
          className="mt-6 rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
        >
          Start another session
        </button>
      </div>
    );
  }

  if (showActive) {
    const title = sessionMeta?.focusItem ?? timer.label ?? "Focus session";
    return (
      <div className="companion-fade-in mx-auto flex max-w-xl flex-col px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Focus session active
        </p>
        <p className="mt-2 text-xl font-semibold text-[#1f1c19]">{title}</p>
        <div className="mt-6 flex justify-center">
          <p className="font-mono text-5xl font-semibold tabular-nums text-[#1e4f4f]">
            {timeDisplay}
          </p>
        </div>
        {sessionMeta?.doneEnough ? (
          <p className="mt-4 rounded-xl bg-[#f0f5f5] px-4 py-3 text-sm text-[#4b463f]">
            <span className="font-semibold text-[#1e4f4f]">Done enough:</span>{" "}
            {sessionMeta.doneEnough}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {running ? (
            <button
              type="button"
              onClick={pause}
              className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white"
            >
              Resume
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-xl px-6 py-3 text-base font-semibold text-[#6b635a] hover:bg-white/60"
          >
            Finish
          </button>
          {onAskShari ? (
            <button
              type="button"
              onClick={onAskShari}
              className="rounded-xl border border-[#c9bfb0] bg-white px-6 py-3 text-base font-semibold text-[#1f1c19] hover:bg-[#faf8f5]"
            >
              Need help?
            </button>
          ) : null}
        </div>
        <p className="mt-4 text-center text-sm text-[#9a8f82]">
          Your timer also runs in the Active bar at the top.
        </p>
      </div>
    );
  }

  if (!showSetup) return null;

  return (
    <div className="companion-fade-in mx-auto flex max-w-xl flex-col px-6 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-[#1f1c19]">Focus Session</p>
          <p className="mt-1 text-base text-[#6b635a]">
            A few quick questions — then we start the timer.
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

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Step {stepIndex + 1} of {FOCUS_SETUP_STEPS.length}
      </p>
      <p className="mt-2 text-lg font-semibold text-[#1f1c19]">{step.question}</p>

      {step.id === "duration" ? (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {FOCUS_QUICK_PICKS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectPreset(m)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedMinutes === m
                    ? "bg-[#1e4f4f] text-white shadow-md"
                    : "bg-white text-[#2d2926] shadow-sm hover:bg-[#f0f5f5]"
                }`}
              >
                {formatFocusDuration(m)}
              </button>
            ))}
          </div>
          <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-[#6b635a]">
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
          <label className="mt-3 flex items-center gap-2 text-sm text-[#6b635a]">
            <input
              type="checkbox"
              checked={rememberDuration}
              onChange={(e) => setRememberDuration(e.target.checked)}
              className="h-4 w-4 rounded border-[#c9bfb0]"
            />
            Remember my preferred duration
          </label>
        </>
      ) : (
        <VoiceAnswerField
          value={
            step.id === "focus"
              ? focusItem
              : step.id === "done-enough"
                ? doneEnough
                : prepNote
          }
          onChange={
            step.id === "focus"
              ? setFocusItem
              : step.id === "done-enough"
                ? setDoneEnough
                : setPrepNote
          }
          placeholder={step.placeholder}
          className="mt-4"
          multiline
        />
      )}

      <div className="mt-8 flex gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-6 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canAdvance()}
          onClick={advanceStep}
          className="rounded-xl bg-[#1e4f4f] px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-[#163a3a] disabled:bg-[#9aaba8]"
        >
          {step.id === "duration"
            ? `Start ${formatFocusDuration(selectedMinutes)}`
            : "Next"}
        </button>
      </div>
    </div>
  );
}
