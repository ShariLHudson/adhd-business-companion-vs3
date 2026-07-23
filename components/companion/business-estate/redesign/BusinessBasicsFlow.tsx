"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUSINESS_BASICS_PAUSE_AFTER,
  BUSINESS_BASICS_QUESTIONS,
  BUSINESS_BASICS_STAGE_OPTIONS,
  BUSINESS_ESTATE_OPTIONAL_REASSURANCE,
  businessBasicsProgress,
  matchStageOptionId,
  persistStageChoiceLabel,
  readIdentityField,
  saveBusinessBasicsAnswer,
} from "@/lib/profile/businessEstateRedesign";
import { BusinessEstateLocalHelp } from "./BusinessEstateLocalHelp";
import { BusinessEstateSessionPause } from "./BusinessEstateSessionPause";
import "@/app/companion/my-business-estate.css";

type Props = {
  onExitToEntrance: () => void;
  onFinished: () => void;
};

type Phase = "welcome-back" | "question" | "pause" | "done";

const AUTOSAVE_MS = 400;

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
  const [savedHint, setSavedHint] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  const choiceRef = useRef(choiceId);
  draftRef.current = draft;
  choiceRef.current = choiceId;

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
    setSavedHint(Boolean(saved.trim()));
  }, [question.fieldKey, question.kind, stepIndex]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  function persistCurrent(options?: { allowEmpty?: boolean }): boolean {
    if (question.kind === "choice") {
      const id = choiceRef.current;
      if (!id) return false;
      saveBusinessBasicsAnswer(
        question.fieldKey,
        persistStageChoiceLabel(id),
      );
      setSavedHint(true);
      return true;
    }
    const value = draftRef.current;
    if (!value.trim()) {
      return options?.allowEmpty === true;
    }
    saveBusinessBasicsAnswer(question.fieldKey, value);
    setSavedHint(true);
    return true;
  }

  function scheduleAutosave() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persistCurrent();
    }, AUTOSAVE_MS);
  }

  function flushAutosave() {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    persistCurrent();
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
    flushAutosave();
    if (question.kind === "choice" && !choiceRef.current) return;
    if (question.kind !== "choice" && !draftRef.current.trim()) return;
    goNextAfterSave();
  }

  function handleSkip() {
    flushAutosave();
    const nextIndex = stepIndex + 1;
    if (nextIndex >= BUSINESS_BASICS_QUESTIONS.length) {
      onFinished();
      return;
    }
    setStepIndex(nextIndex);
  }

  function handleBack() {
    flushAutosave();
    if (stepIndex === 0) {
      onExitToEntrance();
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (phase === "welcome-back") {
    return (
      <div className="be-basics be-basics--card" data-testid="be-basics-welcome-back">
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Welcome Back to Business Basics</h2>
        <p className="be-basics__body">
          You completed {progress.answered} of {progress.total} questions. Your
          answers are saved.
        </p>
        <p className="be-basics__reassurance">{BUSINESS_ESTATE_OPTIONAL_REASSURANCE}</p>
        <div className="be-basics__actions">
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
            className="be-btn be-btn--secondary"
            onClick={onExitToEntrance}
          >
            Back to Identity Office
          </button>
        </div>
      </div>
    );
  }

  if (phase === "pause") {
    return (
      <BusinessEstateSessionPause
        onStop={() => {
          flushAutosave();
          onExitToEntrance();
        }}
        onContinue={() => setPhase("question")}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="be-basics be-basics--card" data-testid="be-basics-done">
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Business Basics Saved</h2>
        <p className="be-basics__body">
          Your answers are saved. Shari has a clearer foundation for your
          business.
        </p>
        <div className="be-basics__actions">
          <button
            type="button"
            className="be-btn be-btn--primary"
            onClick={onFinished}
            data-testid="be-basics-done-back"
          >
            Back to Identity Office
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="be-basics be-basics--card" data-testid="be-basics-flow">
      <p className="be-basics__room">Identity Office</p>
      <p className="be-basics__section">Business Basics</p>
      <p className="be-basics__value" data-testid="be-basics-value">
        Helps Shari greet you and your business by name instead of generic
        advice.
      </p>
      <p
        className="be-basics__progress"
        data-testid="be-basics-progress"
      >
        Question {stepIndex + 1} of {BUSINESS_BASICS_QUESTIONS.length}
        {savedHint ? (
          <span className="be-basics__autosaved"> · Saved</span>
        ) : null}
      </p>
      <h2 className="be-basics__prompt" data-testid="be-basics-prompt">
        {question.prompt}
      </h2>
      <p className="be-basics__reassurance" data-testid="be-basics-reassurance">
        {BUSINESS_ESTATE_OPTIONAL_REASSURANCE}
      </p>

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
              onChange={(e) => {
                setDraft(e.target.value);
                scheduleAutosave();
              }}
              onBlur={flushAutosave}
              data-testid="be-basics-input"
              autoComplete="organization"
              placeholder="Type your answer here"
            />
          ) : null}
          {question.kind === "textarea" ? (
            <textarea
              className="be-basics__textarea"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                scheduleAutosave();
              }}
              onBlur={flushAutosave}
              rows={4}
              data-testid="be-basics-input"
              placeholder="Type a few simple sentences"
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
                    onClick={() => {
                      setChoiceId(opt.id);
                      choiceRef.current = opt.id;
                      saveBusinessBasicsAnswer(
                        question.fieldKey,
                        persistStageChoiceLabel(opt.id),
                      );
                      setSavedHint(true);
                    }}
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
              onClick={handleBack}
              data-testid="be-basics-back"
            >
              Back
            </button>
          </div>

          <div className="be-basics__skip-row">
            <button
              type="button"
              className="be-basics__skip-link"
              onClick={handleSkip}
              data-testid="be-basics-skip"
            >
              Skip for Now
            </button>
            <span className="be-basics__skip-note">
              Skipping is fine — you can always come back to this later.
            </span>
          </div>

          <button
            type="button"
            className="be-basics__help-link"
            onClick={() => setHelpOpen(true)}
            data-testid="be-basics-help"
          >
            Help Me Answer This Question
          </button>
        </>
      )}
    </div>
  );
}
