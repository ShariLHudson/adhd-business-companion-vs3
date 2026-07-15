"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BUSINESS_BASICS_PAUSE_AFTER,
  BUSINESS_BASICS_QUESTIONS,
  BUSINESS_BASICS_STAGE_OPTIONS,
  businessBasicsProgress,
  matchStageOptionId,
  persistStageChoiceLabel,
  readIdentityField,
  saveBusinessBasicsAnswer,
} from "@/lib/profile/businessEstateRedesign";
import { BusinessEstateLocalHelp } from "./BusinessEstateLocalHelp";
import { BusinessEstateSessionPause } from "./BusinessEstateSessionPause";

type Props = {
  onExitToEntrance: () => void;
  onFinished: () => void;
};

type Phase = "welcome-back" | "question" | "pause" | "done";

export function BusinessBasicsFlow({ onExitToEntrance, onFinished }: Props) {
  const initial = useMemo(() => businessBasicsProgress(), []);
  const [phase, setPhase] = useState<Phase>(() =>
    initial.answered > 0 && !initial.complete ? "welcome-back" : "question",
  );
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(initial.nextIndex, BUSINESS_BASICS_QUESTIONS.length - 1),
  );
  const [answersInSession, setAnswersInSession] = useState(0);
  const [draft, setDraft] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [choiceId, setChoiceId] = useState<string | null>(null);

  const question = BUSINESS_BASICS_QUESTIONS[stepIndex]!;
  const progress = businessBasicsProgress();

  useEffect(() => {
    const saved = readIdentityField(question.fieldKey);
    if (question.kind === "choice") {
      setChoiceId(matchStageOptionId(saved));
      setDraft(saved);
    } else {
      setDraft(saved);
      setChoiceId(null);
    }
  }, [question.fieldKey, question.kind, stepIndex]);

  function persistCurrent(): boolean {
    if (question.kind === "choice") {
      if (!choiceId) return false;
      saveBusinessBasicsAnswer(
        question.fieldKey,
        persistStageChoiceLabel(choiceId),
      );
      return true;
    }
    if (!draft.trim()) return false;
    saveBusinessBasicsAnswer(question.fieldKey, draft);
    return true;
  }

  function goNextAfterSave() {
    const nextSession = answersInSession + 1;
    setAnswersInSession(nextSession);
    const nextIndex = stepIndex + 1;
    if (nextIndex >= BUSINESS_BASICS_QUESTIONS.length) {
      setPhase("done");
      return;
    }
    if (nextSession >= BUSINESS_BASICS_PAUSE_AFTER) {
      setStepIndex(nextIndex);
      setPhase("pause");
      setAnswersInSession(0);
      return;
    }
    setStepIndex(nextIndex);
  }

  function handleSaveAndContinue() {
    if (!persistCurrent()) return;
    goNextAfterSave();
  }

  function handleSkip() {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= BUSINESS_BASICS_QUESTIONS.length) {
      onFinished();
      return;
    }
    setStepIndex(nextIndex);
  }

  if (phase === "welcome-back") {
    return (
      <div className="be-basics" data-testid="be-basics-welcome-back">
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Welcome Back to Business Basics</h2>
        <p className="be-basics__body">
          You completed {progress.answered} of {progress.total} questions. Your
          answers are saved.
        </p>
        <button
          type="button"
          className="be-btn be-btn--primary"
          onClick={() => setPhase("question")}
          data-testid="be-basics-continue"
        >
          Continue Business Basics
        </button>
        <button
          type="button"
          className="be-btn be-btn--ghost"
          onClick={onExitToEntrance}
        >
          Back to Identity Office
        </button>
      </div>
    );
  }

  if (phase === "pause") {
    return (
      <BusinessEstateSessionPause
        onStop={onExitToEntrance}
        onContinue={() => setPhase("question")}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="be-basics" data-testid="be-basics-done">
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Business Basics Saved</h2>
        <p className="be-basics__body">
          Your answers are saved. Shari has a clearer foundation for your
          business.
        </p>
        <button
          type="button"
          className="be-btn be-btn--primary"
          onClick={onFinished}
          data-testid="be-basics-done-back"
        >
          Back to Identity Office
        </button>
      </div>
    );
  }

  return (
    <div className="be-basics" data-testid="be-basics-flow">
      <p className="be-basics__room">Identity Office</p>
      <p className="be-basics__section">Business Basics</p>
      <p
        className="be-basics__progress"
        data-testid="be-basics-progress"
      >
        Question {stepIndex + 1} of {BUSINESS_BASICS_QUESTIONS.length}
      </p>
      <h2 className="be-basics__prompt" data-testid="be-basics-prompt">
        {question.prompt}
      </h2>

      {helpOpen ? (
        <BusinessEstateLocalHelp
          open
          room="Identity Office"
          section="Business Basics"
          question={question.prompt}
          helpText={question.help}
          onClose={() => setHelpOpen(false)}
        />
      ) : (
        <>
          {question.kind === "text" ? (
            <input
              className="be-basics__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              data-testid="be-basics-input"
              autoComplete="organization"
            />
          ) : null}
          {question.kind === "textarea" ? (
            <textarea
              className="be-basics__textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              data-testid="be-basics-input"
            />
          ) : null}
          {question.kind === "choice" ? (
            <ul className="be-basics__choices" data-testid="be-basics-choices">
              {BUSINESS_BASICS_STAGE_OPTIONS.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`be-basics__choice${
                      choiceId === opt.id ? " be-basics__choice--selected" : ""
                    }`}
                    onClick={() => setChoiceId(opt.id)}
                    data-testid={`be-basics-choice-${opt.id}`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="be-basics__actions">
            <button
              type="button"
              className="be-btn be-btn--primary"
              onClick={handleSaveAndContinue}
              data-testid="be-basics-save-continue"
            >
              Save and Continue
            </button>
            <button
              type="button"
              className="be-btn be-btn--secondary"
              onClick={() => {
                if (stepIndex === 0) onExitToEntrance();
                else setStepIndex((i) => Math.max(0, i - 1));
              }}
              data-testid="be-basics-back"
            >
              Back
            </button>
            <button
              type="button"
              className="be-btn be-btn--ghost"
              onClick={handleSkip}
              data-testid="be-basics-skip"
            >
              Skip for Now
            </button>
            <button
              type="button"
              className="be-btn be-btn--ghost"
              onClick={() => setHelpOpen(true)}
              data-testid="be-basics-help"
            >
              Help Me Answer This Question
            </button>
          </div>
        </>
      )}
    </div>
  );
}
