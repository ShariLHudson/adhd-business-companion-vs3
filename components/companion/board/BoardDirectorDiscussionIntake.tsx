"use client";

import { useState } from "react";
import type { BoardDirectorId } from "@/lib/board";
import { getBoardDirectorById } from "@/lib/board";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board/visibleDirectors";
import {
  answerIntakeStep,
  createBoardDirectorDiscussion,
  createEmptyBoardDirectorIntake,
  currentIntakePrompt,
  ensureChairInIntake,
  isIntakeComplete,
  upsertBoardDirectorDiscussion,
  type BoardDirectorDiscussionIntakeState,
  type BoardDirectorDiscussionRecord,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import "@/app/companion/boardroom.css";

type Props = {
  initialDirectorIds: readonly BoardDirectorId[];
  onCancel: () => void;
  onComplete: (record: BoardDirectorDiscussionRecord) => void;
};

/**
 * One-question-at-a-time Board discussion intake.
 * Uses Board Director IDs only (Thomas as Chair for this pass).
 */
export function BoardDirectorDiscussionIntake({
  initialDirectorIds,
  onCancel,
  onComplete,
}: Props) {
  const [needsChairConfirm, setNeedsChairConfirm] = useState(
    () => !initialDirectorIds.includes(THOMAS_ELLISON_DIRECTOR_ID),
  );
  const [intake, setIntake] = useState<BoardDirectorDiscussionIntakeState>(() =>
    createEmptyBoardDirectorIntake(initialDirectorIds),
  );
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<BoardDirectorDiscussionRecord | null>(
    null,
  );

  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);

  function confirmChair() {
    setIntake((prev) => ensureChairInIntake(prev));
    setNeedsChairConfirm(false);
  }

  function submitAnswer() {
    const next = answerIntakeStep(intake, draft);
    setDraft("");
    if (isIntakeComplete(next)) {
      const record = createBoardDirectorDiscussion(ensureChairInIntake(next));
      const saved = upsertBoardDirectorDiscussion(record);
      setResult(saved);
      return;
    }
    setIntake(next);
  }

  if (result) {
    return (
      <div
        className="boardroom-director-intake"
        data-testid="board-director-discussion-result"
      >
        <p className="boardroom-kicker">Board Discussion</p>
        <h2 className="boardroom-title">{result.title}</h2>
        <p className="boardroom-purpose">
          Chair review with{" "}
          {result.directorIds
            .map((id) => getBoardDirectorById(id)?.name)
            .filter(Boolean)
            .join(", ")}
          . No other Directors were present.
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
            Return to Boardroom
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
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const prompt = currentIntakePrompt(intake);
  const stepNum = Math.min(
    intake.stepIndex + 1,
    4,
  );

  return (
    <div
      className="boardroom-director-intake"
      data-testid="board-director-discussion-intake"
    >
      <p className="boardroom-kicker">Board Discussion · Step {stepNum} of 4</p>
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
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share what you're considering…"
          data-testid="board-director-intake-answer"
        />
      </div>
      <div className="boardroom-actions">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--primary"
          disabled={!draft.trim()}
          data-testid="board-director-intake-continue"
          onClick={submitAnswer}
        >
          {intake.stepIndex >= 3 ? "Begin discussion" : "Continue"}
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
