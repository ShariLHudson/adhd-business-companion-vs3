"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardDirectorId } from "@/lib/board";
import {
  getBoardDirectorById,
  recommendBoardDirectorsForDecision,
} from "@/lib/board";
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
  type BoardDiscussionContext,
  type BoardDiscussionIntakeDraft,
  type BoardDirectorDiscussionRecord,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { CompactBoardDirectorSelector } from "@/components/companion/board/CompactBoardDirectorSelector";
import { BoardDiscussionOutcomePanel } from "@/components/companion/board/BoardDiscussionOutcomePanel";
import "@/app/companion/boardroom.css";

type Props = {
  initialDirectorIds: readonly BoardDirectorId[];
  /** When true, discard any saved draft and start a fresh decision ask. */
  forceFreshDecision?: boolean;
  /** Current Focus / Call the Board context */
  sourceContext?: BoardDiscussionContext | null;
  onCancel: () => void;
  onComplete: (record: BoardDirectorDiscussionRecord) => void;
  onChooseDirectors?: () => void;
  onReturnToSource?: () => void;
};

/**
 * One-question-at-a-time Board discussion intake → review → one discussion.
 * Chair is optional. Draft is persisted so remounts cannot restart from decision.
 */
export function BoardDirectorDiscussionIntake({
  initialDirectorIds,
  forceFreshDecision = false,
  sourceContext = null,
  onCancel,
  onComplete,
  onChooseDirectors,
  onReturnToSource,
}: Props) {
  const [draft, setDraft] = useState<BoardDiscussionIntakeDraft>(() => {
    if (forceFreshDecision) {
      clearBoardIntakeDraft();
      return createEmptyBoardIntakeDraft(
        initialDirectorIds,
        sourceContext ?? undefined,
      );
    }
    const resolved = resolveInitialBoardIntakeDraft(initialDirectorIds);
    if (sourceContext && !resolved.sourceContext) {
      return { ...resolved, sourceContext };
    }
    return resolved;
  });
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<BoardDirectorDiscussionRecord | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const [editStep, setEditStep] = useState<BoardIntakeStep | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  /** Customize path — single list interface (not shown with recommended preview). */
  const [customizeDirectors, setCustomizeDirectors] = useState(false);
  const [recommendedApplied, setRecommendedApplied] = useState(
    () => initialDirectorIds.length > 0,
  );
  const submitLockRef = useRef(false);

  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);

  useEffect(() => {
    if (draft.currentStep === "discussion" && result) return;
    saveBoardIntakeDraft(draft);
  }, [draft, result]);

  useEffect(() => {
    if (initialDirectorIds.length === 0) return;
    setDraft((prev) => updateDraftDirectors(prev, initialDirectorIds));
    setRecommendedApplied(true);
  }, [initialDirectorIds]);

  useEffect(() => {
    if (!sourceContext) return;
    setDraft((prev) =>
      prev.sourceContext ? prev : { ...prev, sourceContext },
    );
  }, [sourceContext]);

  /** Auto-recommend Directors once a decision is known and none are selected. */
  useEffect(() => {
    if (draft.currentStep !== "review" && draft.currentStep !== "ready_to_begin") {
      return;
    }
    if (draft.selectedDirectorIds.length > 0 || recommendedApplied) return;
    if (!draft.decision.trim()) return;
    const rec = recommendBoardDirectorsForDecision(draft.decision);
    setDraft((prev) => updateDraftDirectors(prev, rec.directorIds));
    setRecommendedApplied(true);
  }, [
    draft.currentStep,
    draft.decision,
    draft.selectedDirectorIds.length,
    recommendedApplied,
  ]);

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
    const focusLabel =
      result.sourceContext?.workTitle ||
      result.sourceContext?.projectName ||
      null;
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-discussion-result"
        data-intake-step="discussion"
      >
        <p className="boardroom-kicker">Board Discussion</p>
        <h2 className="boardroom-title">{result.title}</h2>
        <p className="boardroom-purpose">
          Discussion with {names.join(", ") || "your selected Directors"}.
        </p>
        {focusLabel ? (
          <p
            className="boardroom-purpose"
            data-testid="board-discussion-current-focus"
          >
            Current Focus: {focusLabel}
          </p>
        ) : null}
        <div className="boardroom-director-intake__turns">
          {result.turns.map((turn) => {
            const director =
              turn.directorId != null
                ? getBoardDirectorById(turn.directorId)
                : null;
            const speaker =
              turn.speakerName ||
              director?.name ||
              (turn.role === "chair"
                ? chair?.name ?? "Chair"
                : turn.role === "director"
                  ? "Director"
                  : "Boardroom note");
            const roleLabel =
              director?.shortRole ||
              director?.boardRole ||
              (turn.role === "chair"
                ? "Chair"
                : turn.role === "director"
                  ? "Director"
                  : null);
            return (
              <article
                key={turn.id}
                className="boardroom-card"
                data-testid={`board-director-turn-${turn.role}`}
                data-speaker={speaker}
                data-director-id={turn.directorId ?? undefined}
              >
                <p className="boardroom-card__title">{speaker}</p>
                {roleLabel ? (
                  <p className="boardroom-card__meta">{roleLabel}</p>
                ) : null}
                <p className="boardroom-card__meta whitespace-pre-wrap">
                  {turn.text}
                </p>
              </article>
            );
          })}
        </div>
        {result.decisionRecord ? (
          <div
            className="boardroom-card mt-4"
            data-testid="board-decision-record-summary"
          >
            <p className="boardroom-card__title">Decision Record</p>
            <p className="boardroom-card__meta whitespace-pre-wrap">
              {result.decisionRecord.summary}
            </p>
            {result.decisionRecord.relatedWork &&
            result.decisionRecord.relatedWork.length > 0 ? (
              <div
                className="mt-2"
                data-testid="board-discussion-related-work"
              >
                <p className="boardroom-card__title">Related Work</p>
                <ul
                  className="boardroom-card__meta"
                  style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem" }}
                >
                  {result.decisionRecord.relatedWork.map((ref) => (
                    <li key={`${ref.sourceType}-${ref.sourceId}`}>
                      {ref.label || ref.topic || ref.sourceType}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
        <BoardDiscussionOutcomePanel
          record={result}
          onRecordChange={(next) => {
            const saved = upsertBoardDirectorDiscussion(next);
            setResult(saved);
          }}
          sourceLabel={focusLabel}
          onReturnToSource={onReturnToSource}
        />
        <div className="boardroom-actions">
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
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
          {draft.sourceContext?.projectName ||
          draft.sourceContext?.workTitle ? (
            <div className="boardroom-card" data-testid="board-intake-current-focus">
              <div className="boardroom-card__title">Current Focus</div>
              <div className="boardroom-card__meta">
                {draft.sourceContext.workTitle ||
                  draft.sourceContext.projectName}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <CompactBoardDirectorSelector
            mode={customizeDirectors ? "customize" : "recommended"}
            selectedIds={draft.selectedDirectorIds}
            decisionText={draft.decision}
            autoSelectRecommended={!recommendedApplied}
            onRequestCustomize={() => setCustomizeDirectors(true)}
            onChange={(ids) => {
              persistDraft(updateDraftDirectors(draft, ids));
              setRecommendedApplied(true);
              setSelectionError(null);
            }}
            onLearnAbout={
              onChooseDirectors
                ? () => {
                    onChooseDirectors();
                  }
                : undefined
            }
          />
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
            data-testid="board-director-intake-choose-directors"
            onClick={() => {
              if (customizeDirectors && onChooseDirectors) {
                onChooseDirectors();
                return;
              }
              setCustomizeDirectors((v) => !v);
            }}
          >
            {customizeDirectors
              ? onChooseDirectors
                ? "View the Round Table"
                : "Hide Customize"
              : directors.length > 0
                ? "Customize"
                : "Choose Directors"}
          </button>
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
