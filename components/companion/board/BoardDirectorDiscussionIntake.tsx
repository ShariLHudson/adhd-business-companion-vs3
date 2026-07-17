"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardDirectorId } from "@/lib/board";
import { getBoardDirectorById } from "@/lib/board";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board/visibleDirectors";
import {
  advanceDecisionToReview,
  advanceDraftToReady,
  answerBoardIntakeStep,
  canBeginBoardDiscussion,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardIntakeDraft,
  currentIntakePrompt,
  ensureChairInDraft,
  isQuestionIntakeStep,
  markDraftInDiscussion,
  questionStepNumber,
  resolveInitialBoardIntakeDraft,
  saveBoardIntakeDraft,
  setDraftStep,
  skipBoardIntakeStep,
  updateDraftDirectors,
  upsertBoardDirectorDiscussion,
  type BoardDiscussionIntakeDraft,
  type BoardDirectorDiscussionRecord,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import "@/app/companion/boardroom.css";

type Props = {
  initialDirectorIds: readonly BoardDirectorId[];
  /** When true, discard any saved draft and start a fresh decision ask. */
  forceFreshDecision?: boolean;
  onCancel: () => void;
  onComplete: (record: BoardDirectorDiscussionRecord) => void;
  onChooseDirectors?: () => void;
};

/**
 * One-question-at-a-time Board discussion intake → review → one discussion.
 * Chair is optional. Draft is persisted so remounts cannot restart from decision.
 */
export function BoardDirectorDiscussionIntake({
  initialDirectorIds,
  forceFreshDecision = false,
  onCancel,
  onComplete,
  onChooseDirectors,
}: Props) {
  const [draft, setDraft] = useState<BoardDiscussionIntakeDraft>(() => {
    if (forceFreshDecision) {
      clearBoardIntakeDraft();
      return createEmptyBoardIntakeDraft(initialDirectorIds);
    }
    return resolveInitialBoardIntakeDraft(initialDirectorIds);
  });
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<BoardDirectorDiscussionRecord | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const [editStep, setEditStep] = useState<BoardIntakeStep | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);

  useEffect(() => {
    if (draft.currentStep === "discussion" && result) return;
    saveBoardIntakeDraft(draft);
  }, [draft, result]);

  useEffect(() => {
    if (initialDirectorIds.length === 0) return;
    setDraft((prev) => updateDraftDirectors(prev, initialDirectorIds));
  }, [initialDirectorIds]);

  function persistDraft(next: BoardDiscussionIntakeDraft) {
    setDraft(next);
    saveBoardIntakeDraft(next);
  }

  function submitAnswer() {
    if (submitLockRef.current || submitting) return;
    if (!isQuestionIntakeStep(draft.currentStep) && !editStep) return;
    if (!answer.trim()) return;

    submitLockRef.current = true;
    setSubmitting(true);
    setSelectionError(null);
    try {
      if (editStep && isQuestionIntakeStep(editStep)) {
        const editing = { ...draft, currentStep: editStep };
        const merged = answerBoardIntakeStep(editing, answer);
        const restored: BoardDiscussionIntakeDraft = {
          ...merged,
          currentStep: "review",
          updatedAt: new Date().toISOString(),
        };
        setAnswer("");
        setEditStep(null);
        persistDraft(restored);
        return;
      }

      const next = answerBoardIntakeStep(draft, answer);
      setAnswer("");
      persistDraft(next);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  function skipOptional() {
    if (draft.currentStep === "decision") return;
    persistDraft(skipBoardIntakeStep(draft));
    setAnswer("");
  }

  function startWithDecisionOnly() {
    if (!draft.decision.trim() && !answer.trim()) return;
    let next = draft;
    if (draft.currentStep === "decision" && answer.trim()) {
      next = answerBoardIntakeStep(draft, answer);
      setAnswer("");
    }
    persistDraft(advanceDecisionToReview(next));
  }

  function beginBoardDiscussion() {
    if (submitLockRef.current || submitting) return;
    const readyDraft = ensureChairInDraft(
      draft.currentStep === "review" || draft.currentStep === "ready_to_begin"
        ? draft
        : advanceDecisionToReview(draft),
    );
    if (!canBeginBoardDiscussion(readyDraft)) {
      if (!readyDraft.decision.trim()) {
        setSelectionError(
          "What would you like the selected Directors to discuss?",
        );
        persistDraft(setDraftStep(readyDraft, "decision"));
        return;
      }
      setSelectionError("Choose at least one Director to begin.");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setSelectionError(null);
    try {
      const ready = advanceDraftToReady({
        ...readyDraft,
        currentStep: "review",
      });
      const inDiscussion = markDraftInDiscussion(ready);
      const record = createBoardDirectorDiscussionFromDraft(inDiscussion);
      const saved = upsertBoardDirectorDiscussion(record);
      clearBoardIntakeDraft();
      persistDraft(inDiscussion);
      setResult(saved);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  function saveAndReturnLater() {
    saveBoardIntakeDraft(draft);
    onCancel();
  }

  function startOverConfirmed() {
    clearBoardIntakeDraft();
    const empty = createEmptyBoardIntakeDraft(initialDirectorIds);
    setDraft(empty);
    setAnswer("");
    setResult(null);
    setEditStep(null);
    setSelectionError(null);
    setConfirmStartOver(false);
  }

  function changeAnswer(step: BoardIntakeStep) {
    if (!isQuestionIntakeStep(step)) return;
    setEditStep(step);
    const seed =
      step === "decision"
        ? draft.decision
        : step === "importance"
          ? draft.importance
          : step === "options"
            ? draft.options.join("\n")
            : draft.concerns;
    setAnswer(seed);
    persistDraft(setDraftStep(draft, step));
  }

  if (result) {
    const names = result.directorIds
      .map((id) => getBoardDirectorById(id)?.name)
      .filter(Boolean);
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-discussion-result"
        data-intake-step="discussion"
      >
        <p className="boardroom-kicker">Board Discussion</p>
        <h2 className="boardroom-title">{result.title}</h2>
        <p className="boardroom-purpose">
          Discussion begun with {names.join(", ") || "your selected Directors"}.
        </p>
        <div className="boardroom-director-intake__turns">
          {result.turns.map((turn) => (
            <article
              key={turn.id}
              className="boardroom-card"
              data-testid={`board-director-turn-${turn.role}`}
            >
              <p className="boardroom-card__title">
                {turn.role === "chair"
                  ? chair?.name ?? "Chair"
                  : "Boardroom note"}
              </p>
              <p className="boardroom-card__meta whitespace-pre-wrap">
                {turn.text}
              </p>
            </article>
          ))}
        </div>
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid="board-director-discussion-done"
            onClick={() => onComplete(result)}
          >
            Return to Boardroom Home
          </button>
        </div>
      </div>
    );
  }

  if (confirmStartOver) {
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-intake-start-over-confirm"
      >
        <p className="boardroom-kicker">Board Discussion</p>
        <h2 className="boardroom-title">Start over?</h2>
        <p className="boardroom-purpose">
          Start over and clear these Board intake answers?
        </p>
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid="board-director-intake-start-over-confirm-yes"
            onClick={startOverConfirmed}
          >
            Start Over
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            data-testid="board-director-intake-start-over-keep"
            onClick={() => setConfirmStartOver(false)}
          >
            Keep My Answers
          </button>
        </div>
      </div>
    );
  }

  if (draft.currentStep === "review" || draft.currentStep === "ready_to_begin") {
    const directors = draft.selectedDirectorIds
      .map((id) => getBoardDirectorById(id)?.name)
      .filter(Boolean);

    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-intake-review"
        data-intake-step={draft.currentStep}
      >
        <p className="boardroom-kicker">Board Discussion · Review</p>
        <h2 className="boardroom-title">Before we begin</h2>
        <p className="boardroom-purpose">
          Please confirm what you&apos;re bringing to the Round Table. The Chair
          is optional.
        </p>

        {selectionError ? (
          <p
            className="boardroom-purpose"
            data-testid="board-director-intake-error"
            role="alert"
          >
            {selectionError}
          </p>
        ) : null}

        <div
          className="boardroom-card-list mt-4"
          data-testid="board-intake-review-summary"
        >
          <div className="boardroom-card">
            <div className="boardroom-card__title">Decision</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {draft.decision || "—"}
            </div>
          </div>
          {draft.importance.trim() ? (
            <div className="boardroom-card">
              <div className="boardroom-card__title">Why it matters now</div>
              <div className="boardroom-card__meta whitespace-pre-wrap">
                {draft.importance}
              </div>
            </div>
          ) : null}
          {draft.options.length > 0 ? (
            <div className="boardroom-card">
              <div className="boardroom-card__title">Options</div>
              <ul
                className="boardroom-card__meta"
                style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}
              >
                {draft.options.map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {draft.concerns.trim() ? (
            <div className="boardroom-card">
              <div className="boardroom-card__title">Concerns</div>
              <div className="boardroom-card__meta whitespace-pre-wrap">
                {draft.concerns}
              </div>
            </div>
          ) : null}
          <div className="boardroom-card">
            <div className="boardroom-card__title">Selected Directors</div>
            <div className="boardroom-card__meta">
              {directors.length > 0
                ? directors.join(", ")
                : "None selected yet"}
            </div>
          </div>
        </div>

        <div className="boardroom-actions" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid="board-director-intake-begin"
            disabled={submitting}
            onClick={beginBoardDiscussion}
          >
            Begin Board Discussion
          </button>
          {onChooseDirectors ? (
            <button
              type="button"
              className="boardroom-btn boardroom-btn--secondary"
              data-testid="board-director-intake-choose-directors"
              onClick={onChooseDirectors}
            >
              {directors.length > 0
                ? "Change Directors"
                : "Choose Directors"}
            </button>
          ) : null}
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-change-decision"
            onClick={() => changeAnswer("decision")}
          >
            Edit Decision
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            data-testid="board-director-intake-save-return"
            onClick={saveAndReturnLater}
          >
            Save and Return Later
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            data-testid="board-director-intake-start-over"
            onClick={() => setConfirmStartOver(true)}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const activeStep = editStep ?? draft.currentStep;
  const prompt =
    activeStep === "decision"
      ? "What decision, situation, or question would you like to bring to the Board?"
      : currentIntakePrompt({ currentStep: activeStep });
  const stepNum = questionStepNumber(
    isQuestionIntakeStep(activeStep) ? activeStep : "decision",
  );
  const optionalStep =
    isQuestionIntakeStep(activeStep) && activeStep !== "decision";

  return (
    <div
      className="boardroom-director-intake"
      data-testid="board-director-discussion-intake"
      data-intake-step={activeStep}
    >
      <p className="boardroom-kicker">
        Board Discussion · Step {stepNum} of 4
      </p>
      <h2 className="boardroom-title">{prompt}</h2>
      <p className="boardroom-purpose">
        One question at a time. Optional details can be skipped. The Chair is
        optional.
      </p>
      {selectionError ? (
        <p
          className="boardroom-purpose"
          data-testid="board-director-intake-error"
          role="alert"
        >
          {selectionError}
        </p>
      ) : null}
      {draft.selectedDirectorIds.length > 0 ? (
        <p
          className="boardroom-purpose"
          data-testid="board-director-intake-selection-summary"
        >
          Selected Directors:{" "}
          {draft.selectedDirectorIds
            .map((id) => getBoardDirectorById(id)?.name)
            .filter(Boolean)
            .join(", ")}
        </p>
      ) : null}
      <div className="boardroom-field mt-4">
        <label htmlFor="board-director-intake-answer" className="sr-only">
          {prompt}
        </label>
        <textarea
          id="board-director-intake-answer"
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitAnswer();
            }
          }}
          placeholder="Share what you're considering…"
          data-testid="board-director-intake-answer"
          disabled={submitting}
        />
      </div>
      <div className="boardroom-actions" style={{ flexWrap: "wrap" }}>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--primary"
          disabled={!answer.trim() || submitting}
          data-testid="board-director-intake-continue"
          onClick={submitAnswer}
        >
          {activeStep === "concerns" && !editStep
            ? "Continue to review"
            : "Continue"}
        </button>
        {optionalStep ? (
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-skip"
            onClick={skipOptional}
            disabled={submitting}
          >
            Skip Optional Details
          </button>
        ) : null}
        {activeStep === "decision" && draft.selectedDirectorIds.length > 0 ? (
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-start-with-decision"
            disabled={!answer.trim() && !draft.decision.trim()}
            onClick={startWithDecisionOnly}
          >
            Continue to Review
          </button>
        ) : null}
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          data-testid="board-director-intake-save-return"
          onClick={saveAndReturnLater}
          disabled={submitting}
        >
          Save and Return Later
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
