"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardDirectorId } from "@/lib/board";
import { getBoardDirectorById } from "@/lib/board";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board/visibleDirectors";
import {
  advanceDraftToReady,
  answerBoardIntakeStep,
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
  updateDraftDirectors,
  upsertBoardDirectorDiscussion,
  type BoardDiscussionIntakeDraft,
  type BoardDirectorDiscussionRecord,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import "@/app/companion/boardroom.css";

type Props = {
  initialDirectorIds: readonly BoardDirectorId[];
  onCancel: () => void;
  onComplete: (record: BoardDirectorDiscussionRecord) => void;
};

/**
 * One-question-at-a-time Board discussion intake → review → one discussion.
 * Draft is persisted so remounts cannot restart from decision.
 */
export function BoardDirectorDiscussionIntake({
  initialDirectorIds,
  onCancel,
  onComplete,
}: Props) {
  const [draft, setDraft] = useState<BoardDiscussionIntakeDraft>(() =>
    resolveInitialBoardIntakeDraft(initialDirectorIds),
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<BoardDirectorDiscussionRecord | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const [editStep, setEditStep] = useState<BoardIntakeStep | null>(null);
  const submitLockRef = useRef(false);

  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
  const needsChairConfirm =
    !draft.chairConfirmed &&
    !draft.selectedDirectorIds.includes(THOMAS_ELLISON_DIRECTOR_ID);

  useEffect(() => {
    if (draft.currentStep === "discussion" && result) return;
    saveBoardIntakeDraft(draft);
  }, [draft, result]);

  useEffect(() => {
    if (initialDirectorIds.length === 0) return;
    setDraft((prev) => {
      if (prev.selectedDirectorIds.length > 0) return prev;
      return updateDraftDirectors(prev, initialDirectorIds);
    });
  }, [initialDirectorIds]);

  function persistDraft(next: BoardDiscussionIntakeDraft) {
    setDraft(next);
    saveBoardIntakeDraft(next);
  }

  function confirmChair() {
    persistDraft(ensureChairInDraft(draft));
  }

  function submitAnswer() {
    if (submitLockRef.current || submitting) return;
    if (!isQuestionIntakeStep(draft.currentStep) && !editStep) return;
    if (!answer.trim()) return;

    submitLockRef.current = true;
    setSubmitting(true);
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

  function beginBoardDiscussion() {
    if (submitLockRef.current || submitting) return;
    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const ready = advanceDraftToReady(
        draft.currentStep === "review"
          ? draft
          : { ...draft, currentStep: "review" },
      );
      const inDiscussion = markDraftInDiscussion(ensureChairInDraft(ready));
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
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-discussion-result"
        data-intake-step="discussion"
      >
        <p className="boardroom-kicker">Board Discussion</p>
        <h2 className="boardroom-title">{result.title}</h2>
        <p className="boardroom-purpose">
          Chair opening with{" "}
          {result.directorIds
            .map((id) => getBoardDirectorById(id)?.name)
            .filter(Boolean)
            .join(", ")}
          .
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

  if (needsChairConfirm) {
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-chair-confirm"
      >
        <p className="boardroom-kicker">Start a Board Discussion</p>
        <h2 className="boardroom-title">The Chair is required</h2>
        <p className="boardroom-purpose">
          Every Board discussion includes the Chair.{" "}
          {chair?.name ?? "Thomas Ellison"} guides the conversation toward a
          clear recommendation. Would you like to include the Chair now?
        </p>
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid="board-director-confirm-chair"
            onClick={confirmChair}
          >
            Include {chair?.name ?? "Thomas"} as Chair
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            onClick={saveAndReturnLater}
          >
            Save and Return Later
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            onClick={onCancel}
          >
            Cancel
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
          Please confirm what you&apos;re bringing to the Round Table.
        </p>

        <div className="boardroom-card-list mt-4" data-testid="board-intake-review-summary">
          <div className="boardroom-card">
            <div className="boardroom-card__title">Decision</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {draft.decision}
            </div>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Why it matters now</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {draft.importance}
            </div>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Options</div>
            <ul className="boardroom-card__meta" style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}>
              {draft.options.map((opt) => (
                <li key={opt}>{opt}</li>
              ))}
            </ul>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Concerns</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {draft.concerns}
            </div>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Selected Directors</div>
            <div className="boardroom-card__meta">
              {directors.length > 0 ? directors.join(", ") : chair?.name}
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
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-change-decision"
            onClick={() => changeAnswer("decision")}
          >
            Change an Answer
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-change-importance"
            onClick={() => changeAnswer("importance")}
          >
            Edit why it matters
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-change-options"
            onClick={() => changeAnswer("options")}
          >
            Edit options
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="board-director-intake-change-concerns"
            onClick={() => changeAnswer("concerns")}
          >
            Edit concerns
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
        <p className="boardroom-purpose mt-3">
          To add or remove Directors, return to Meet the Directors, then bring
          the decision again — your answers stay saved until you Start Over.
        </p>
      </div>
    );
  }

  const activeStep = editStep ?? draft.currentStep;
  const prompt = currentIntakePrompt({ currentStep: activeStep });
  const stepNum = questionStepNumber(
    isQuestionIntakeStep(activeStep) ? activeStep : "decision",
  );

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
        One question at a time.{" "}
        {chair?.name ?? "Thomas"} is at the table as Chair.
      </p>
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
      <div className="boardroom-actions">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--primary"
          disabled={!answer.trim() || submitting}
          data-testid="board-director-intake-continue"
          onClick={submitAnswer}
        >
          {activeStep === "concerns" && !editStep ? "Continue to review" : "Continue"}
        </button>
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
