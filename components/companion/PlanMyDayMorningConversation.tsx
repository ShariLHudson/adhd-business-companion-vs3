"use client";

import { useEffect, useRef, useState } from "react";
import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  MORNING_ADAPT_PROMPTS,
  MORNING_CAPTURE_COPY,
  MORNING_CAPTURE_PLACEHOLDER,
  MORNING_THINKING_LINES,
  MORNING_THINKING_MS,
  buildMorningResultsPresentation,
  formatPriorityStars,
  type MorningResultsPresentation,
} from "@/lib/planMyDay/morningConversation";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";

type Phase = "capture" | "thinking" | "results" | "adapt";

type Props = {
  judgment: CompanionJudgmentResult;
  onPrevious: () => void;
  onConfirm: () => void;
  onNotRightNow: () => void;
};

export function PlanMyDayMorningConversation({
  judgment,
  onPrevious,
  onConfirm,
  onNotRightNow,
}: Props) {
  const [phase, setPhase] = useState<Phase>("capture");
  const [mindText, setMindText] = useState("");
  const [results, setResults] = useState<MorningResultsPresentation | null>(
    null,
  );
  const [thinkingLine, setThinkingLine] = useState(0);
  const [adaptNotes, setAdaptNotes] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const adaptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || phase !== "capture") return;
    el.style.height = "auto";
    el.style.height = `${Math.max(120, el.scrollHeight)}px`;
  }, [mindText, phase]);

  useEffect(() => {
    if (phase !== "thinking") return;
    setThinkingLine(0);
    const lineTimer = window.setInterval(() => {
      setThinkingLine((line) => (line + 1) % MORNING_THINKING_LINES.length);
    }, 1100);
    const doneTimer = window.setTimeout(() => {
      const presentation = buildMorningResultsPresentation(judgment, mindText);
      setResults(presentation);
      setPhase("results");
    }, MORNING_THINKING_MS);
    return () => {
      window.clearInterval(lineTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase, judgment, mindText]);

  function beginThinking() {
    if (!mindText.trim()) {
      inputRef.current?.focus();
      return;
    }
    setPhase("thinking");
  }

  function submitAdapt() {
    const addition = adaptNotes.trim();
    if (!addition) {
      adaptRef.current?.focus();
      return;
    }
    setMindText((prev) => (prev.trim() ? `${prev.trim()}\n${addition}` : addition));
    setAdaptNotes("");
    setPhase("thinking");
  }

  return (
    <section
      className="plan-day-morning-conversation"
      data-testid="plan-day-morning-conversation"
      data-phase={phase}
      aria-label="Plan My Day morning conversation"
    >
      <button
        type="button"
        className="plan-day-morning-note__previous"
        onClick={onPrevious}
        data-testid="app-back-button"
      >
        <span aria-hidden="true">←</span>
        <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
      </button>

      {phase === "capture" ? (
        <>
          <h1 className="plan-day-morning-note__title">
            {MORNING_CAPTURE_COPY.title}
          </h1>
          <h2 className="plan-day-morning-note__question">
            {MORNING_CAPTURE_COPY.question}
          </h2>
          <p className="plan-day-morning-note__helper">
            {MORNING_CAPTURE_COPY.helper}
          </p>

          <div
            className="plan-day-morning-capture plan-day-morning-capture--inset-mic"
            data-testid="plan-day-morning-capture"
          >
            <VoiceAnswerField
              value={mindText}
              onChange={setMindText}
              inputRef={inputRef}
              placeholder={MORNING_CAPTURE_PLACEHOLDER}
              micTitle="Speak what's on your mind today"
              className="plan-day-morning-capture__voice"
              inputClassName="plan-day-morning-capture__input"
              onVoiceUsed={() => undefined}
            />
          </div>

          <button
            type="button"
            className="plan-day-morning-conversation__submit"
            onClick={beginThinking}
            data-testid="plan-day-morning-submit"
          >
            {MORNING_CAPTURE_COPY.submit}
          </button>
        </>
      ) : null}

      {phase === "thinking" ? (
        <div
          className="plan-day-morning-thinking"
          data-testid="plan-day-morning-thinking"
          aria-live="polite"
        >
          <p
            key={thinkingLine}
            className="plan-day-morning-thinking__line"
          >
            {MORNING_THINKING_LINES[thinkingLine]}
          </p>
        </div>
      ) : null}

      {phase === "results" && results ? (
        <div
          className="plan-day-morning-results"
          data-testid="plan-day-morning-results"
        >
          <div className="plan-day-morning-results__intro">
            {results.introLines.map((line) => (
              <p key={line} className="plan-day-morning-results__line">
                {line}
              </p>
            ))}
          </div>

          {results.priorities.length > 0 ? (
            <section
              className="plan-day-morning-results__section"
              aria-label="Today's priorities"
            >
              <h3 className="plan-day-morning-results__heading">
                Today&apos;s Priorities
              </h3>
              <ul className="plan-day-morning-results__priority-list">
                {results.priorities.map((priority) => (
                  <li key={priority.label}>
                    <span aria-hidden="true">
                      {formatPriorityStars(priority.stars)}
                    </span>{" "}
                    {priority.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.laterThisWeek.length > 0 || results.canWait.length > 0 ? (
            <section
              className="plan-day-morning-results__section"
              aria-label="Everything else"
            >
              <h3 className="plan-day-morning-results__heading">
                Everything Else
              </h3>
              {results.laterThisWeek.length > 0 ? (
                <div className="plan-day-morning-results__bucket">
                  <p className="plan-day-morning-results__bucket-title">
                    Later This Week
                  </p>
                  <ul>
                    {results.laterThisWeek.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {results.canWait.length > 0 ? (
                <div className="plan-day-morning-results__bucket">
                  <p className="plan-day-morning-results__bucket-title">
                    Can Wait
                  </p>
                  <ul>
                    {results.canWait.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <p className="plan-day-morning-results__direction">
            {results.directionQuestion}
          </p>

          <div
            className="plan-day-morning-note__actions plan-day-morning-note__actions--triple"
            data-testid="plan-day-confirm-actions"
          >
            <button
              type="button"
              onClick={onConfirm}
              className="plan-day-morning-note__btn plan-day-morning-note__btn--choice"
              data-testid="plan-day-confirm-primary"
            >
              ✔ {MORNING_CAPTURE_COPY.yesFeelsRight}
            </button>
            <button
              type="button"
              onClick={() => setPhase("adapt")}
              className="plan-day-morning-note__btn plan-day-morning-note__btn--choice"
              data-testid="plan-day-confirm-adjust"
            >
              🔄 {MORNING_CAPTURE_COPY.adaptMyDay}
            </button>
            <button
              type="button"
              onClick={onNotRightNow}
              className="plan-day-morning-note__btn plan-day-morning-note__btn--choice"
              data-testid="plan-day-confirm-defer"
            >
              ⏸ {MORNING_CAPTURE_COPY.notRightNow}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "adapt" ? (
        <div
          className="plan-day-morning-adapt"
          data-testid="plan-day-morning-adapt"
        >
          <h2 className="plan-day-morning-note__question">
            {MORNING_CAPTURE_COPY.adaptMyDay}
          </h2>
          <ul className="plan-day-morning-adapt__prompts">
            {MORNING_ADAPT_PROMPTS.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
          <div className="plan-day-morning-capture plan-day-morning-capture--inset-mic">
            <VoiceAnswerField
              value={adaptNotes}
              onChange={setAdaptNotes}
              inputRef={adaptRef}
              placeholder="Tell me what to adjust..."
              micTitle="Speak what to adjust"
              className="plan-day-morning-capture__voice"
              inputClassName="plan-day-morning-capture__input plan-day-morning-capture__input--compact"
            />
          </div>
          <div className="plan-day-morning-adapt__actions">
            <button
              type="button"
              className="plan-day-morning-note__btn plan-day-morning-note__btn--choice"
              onClick={() => setPhase("results")}
            >
              Back
            </button>
            <button
              type="button"
              className="plan-day-morning-conversation__submit"
              onClick={submitAdapt}
              data-testid="plan-day-morning-adapt-submit"
            >
              Let&apos;s adapt together
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
