"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUSINESS_ESTATE_OPTIONAL_REASSURANCE,
  YOUR_STORY_QUESTIONS,
  readYourStoryField,
  saveYourStoryAnswer,
  yourStoryProgress,
} from "@/lib/profile/businessEstateRedesign";
import { BusinessEstateLocalHelp } from "./BusinessEstateLocalHelp";
import "@/app/companion/my-business-estate.css";

type Props = {
  onExitToEntrance: () => void;
  onFinished: () => void;
};

type Phase = "welcome-back" | "question" | "done";

const AUTOSAVE_MS = 400;

/**
 * Your Story — a calm guided walk over existing identity story fields
 * (businessStory, whatInspiredYou, whatHelpsYouContinue). No new storage;
 * reuses the Business Basics interaction pattern.
 */
export function YourStoryFlow({ onExitToEntrance, onFinished }: Props) {
  const initial = useMemo(() => yourStoryProgress(), []);
  const [phase, setPhase] = useState<Phase>(() =>
    initial.answered > 0 && !initial.complete ? "welcome-back" : "question",
  );
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(initial.nextIndex, YOUR_STORY_QUESTIONS.length - 1),
  );
  const [draft, setDraft] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const question = YOUR_STORY_QUESTIONS[stepIndex]!;
  const progress = yourStoryProgress();

  useEffect(() => {
    const saved = readYourStoryField(question.fieldKey);
    setDraft(saved);
    setSavedHint(Boolean(saved.trim()));
  }, [question.fieldKey, stepIndex]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  function persistCurrent(): void {
    const value = draftRef.current;
    if (!value.trim()) return;
    saveYourStoryAnswer(question.fieldKey, value);
    setSavedHint(true);
  }

  function scheduleAutosave() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => persistCurrent(), AUTOSAVE_MS);
  }

  function flushAutosave() {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    persistCurrent();
  }

  function goNext() {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= YOUR_STORY_QUESTIONS.length) {
      setPhase("done");
      return;
    }
    setStepIndex(nextIndex);
  }

  function handleSaveAndContinue() {
    flushAutosave();
    if (!draftRef.current.trim()) return;
    goNext();
  }

  function handleSkip() {
    flushAutosave();
    const nextIndex = stepIndex + 1;
    if (nextIndex >= YOUR_STORY_QUESTIONS.length) {
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
      <div
        className="be-basics be-basics--card"
        data-testid="be-your-story-welcome-back"
      >
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Welcome Back to Your Story</h2>
        <p className="be-basics__body">
          You shared {progress.answered} of {progress.total}. Your words are
          saved.
        </p>
        <p className="be-basics__reassurance">
          {BUSINESS_ESTATE_OPTIONAL_REASSURANCE}
        </p>
        <div className="be-basics__actions">
          <button
            type="button"
            className="be-btn be-btn--primary"
            onClick={() => setPhase("question")}
            data-testid="be-your-story-continue"
          >
            Continue Your Story
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

  if (phase === "done") {
    return (
      <div className="be-basics be-basics--card" data-testid="be-your-story-done">
        <p className="be-basics__room">Identity Office</p>
        <h2 className="be-basics__title">Your Story Saved</h2>
        <p className="be-basics__body">
          Thank you for sharing it. Shari can hold your story in mind when she
          helps you.
        </p>
        <div className="be-basics__actions">
          <button
            type="button"
            className="be-btn be-btn--primary"
            onClick={onFinished}
            data-testid="be-your-story-done-back"
          >
            Back to Identity Office
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="be-basics be-basics--card" data-testid="be-your-story-flow">
      <p className="be-basics__room">Identity Office</p>
      <p className="be-basics__section">Your Story</p>
      <p className="be-basics__value" data-testid="be-your-story-value">
        Helps Shari understand how your business came to be.
      </p>
      <p className="be-basics__progress" data-testid="be-your-story-progress">
        Question {stepIndex + 1} of {YOUR_STORY_QUESTIONS.length}
        {savedHint ? <span className="be-basics__autosaved"> · Saved</span> : null}
      </p>
      <h2 className="be-basics__prompt" data-testid="be-your-story-prompt">
        {question.prompt}
      </h2>
      <p
        className="be-basics__reassurance"
        data-testid="be-your-story-reassurance"
      >
        {BUSINESS_ESTATE_OPTIONAL_REASSURANCE}
      </p>

      {helpOpen ? (
        <BusinessEstateLocalHelp
          open
          room="Identity Office"
          section="Your Story"
          question={question.prompt}
          helpText={question.help}
          onClose={() => setHelpOpen(false)}
        />
      ) : (
        <>
          <textarea
            className="be-basics__textarea"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              scheduleAutosave();
            }}
            onBlur={flushAutosave}
            rows={4}
            data-testid="be-your-story-input"
            placeholder="Type a few simple sentences"
          />

          <div className="be-basics__actions">
            <button
              type="button"
              className="be-btn be-btn--primary"
              onClick={handleSaveAndContinue}
              data-testid="be-your-story-save-continue"
            >
              Save and Continue
            </button>
            <button
              type="button"
              className="be-btn be-btn--secondary"
              onClick={handleBack}
              data-testid="be-your-story-back"
            >
              Back
            </button>
          </div>

          <div className="be-basics__skip-row">
            <button
              type="button"
              className="be-basics__skip-link"
              onClick={handleSkip}
              data-testid="be-your-story-skip"
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
            data-testid="be-your-story-help"
          >
            Help Me Answer This Question
          </button>
        </>
      )}
    </div>
  );
}
