/**
 * Board discussion intake state machine — regression for concerns → review.
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  BOARD_INTAKE_QUESTION_STEPS,
  advanceDraftToReady,
  answerBoardIntakeStep,
  answerIntakeStep,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussion,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardDirectorIntake,
  createEmptyBoardIntakeDraft,
  ensureChairInIntake,
  isIntakeComplete,
  isQuestionIntakeStep,
  loadBoardIntakeDraft,
  markDraftInDiscussion,
  resolveInitialBoardIntakeDraft,
  saveBoardIntakeDraft,
  setDraftStep,
  updateDraftDirectors,
  type BoardDiscussionIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

function answerAllQuestions(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  let d = draft;
  d = answerBoardIntakeStep(d, "Whether to keep this client");
  d = answerBoardIntakeStep(d, "The same problems keep repeating");
  d = answerBoardIntakeStep(d, "End now\nPause and renegotiate\nContinue with boundaries");
  d = answerBoardIntakeStep(d, "Hurting the relationship vs staying stuck");
  return d;
}

describe("Board intake state machine", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
  });

  it("decision advances to importance", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Whether to expand");
    expect(d.currentStep).toBe("importance");
    expect(d.decision).toBe("Whether to expand");
  });

  it("importance advances to options", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Decision A");
    d = answerBoardIntakeStep(d, "Timing is tight");
    expect(d.currentStep).toBe("options");
    expect(d.importance).toBe("Timing is tight");
  });

  it("options advances to concerns", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Decision A");
    d = answerBoardIntakeStep(d, "Timing");
    d = answerBoardIntakeStep(d, "Option one\nOption two");
    expect(d.currentStep).toBe("concerns");
    expect(d.options).toEqual(["Option one", "Option two"]);
  });

  it("concerns advances to review — never back to decision", () => {
    const d = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    expect(d.currentStep).toBe("review");
    expect(d.currentStep).not.toBe("decision");
    expect(isQuestionIntakeStep(d.currentStep)).toBe(false);
  });

  it("regression: exact reported sequence keeps all answers after concerns", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Whether to keep this client");
    d = answerBoardIntakeStep(d, "The same problems keep repeating");
    d = answerBoardIntakeStep(d, "End · Pause · Continue");
    d = answerBoardIntakeStep(d, "Hurting the relationship");
    expect(d.currentStep).toBe("review");
    expect(d.decision).toBe("Whether to keep this client");
    expect(d.importance).toBe("The same problems keep repeating");
    expect(d.options.length).toBeGreaterThan(0);
    expect(d.concerns).toBe("Hurting the relationship");
    expect(d.selectedDirectorIds).toContain("board-chair");
  });

  it("prior answers and Directors remain after each step", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Decision");
    expect(d.selectedDirectorIds).toEqual(["board-chair"]);
    d = answerBoardIntakeStep(d, "Why");
    expect(d.decision).toBe("Decision");
    d = answerBoardIntakeStep(d, "A\nB");
    expect(d.importance).toBe("Why");
    d = answerBoardIntakeStep(d, "Risk");
    expect(d.options).toEqual(["A", "B"]);
    expect(d.selectedDirectorIds).toEqual(["board-chair"]);
  });

  it("changing selected Directors does not reset intake answers", () => {
    let d = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    d = updateDraftDirectors(d, ["board-chair", "devils-advocate"]);
    expect(d.currentStep).toBe("review");
    expect(d.decision).toBe("Whether to keep this client");
    expect(d.selectedDirectorIds).toContain("devils-advocate");
  });

  it("Begin Board Discussion creates one discussion from review", () => {
    let d = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    d = advanceDraftToReady(d);
    expect(d.currentStep).toBe("ready_to_begin");
    d = markDraftInDiscussion(d);
    const record = createBoardDirectorDiscussionFromDraft(d);
    expect(record.answers.decision).toContain("keep this client");
    expect(record.answers["why-now"]).toContain("same problems");
    expect(record.turns.some((t) => t.role === "chair")).toBe(true);
    expect(record.turns[0]?.text).toContain(
      "I'll invite each Director to speak in their role",
    );
    expect(record.directorIds).toContain("board-chair");
    expect(record.status).toBe("in-progress");
  });

  it("answering again on review does not create a second question loop", () => {
    let d = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    const again = answerBoardIntakeStep(d, "should not apply");
    expect(again.currentStep).toBe("review");
    expect(again.decision).toBe(d.decision);
  });

  it("Start Over is modeled as explicit empty draft only", () => {
    const filled = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    saveBoardIntakeDraft(filled);
    clearBoardIntakeDraft();
    const empty = createEmptyBoardIntakeDraft(["board-chair"]);
    expect(empty.currentStep).toBe("decision");
    expect(empty.decision).toBe("");
    expect(loadBoardIntakeDraft()).toBeNull();
  });

  it("resolveInitialBoardIntakeDraft restores in-progress draft (remount safety)", () => {
    const filled = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    saveBoardIntakeDraft(filled);
    const restored = resolveInitialBoardIntakeDraft([]);
    expect(restored.currentStep).toBe("review");
    expect(restored.decision).toBe("Whether to keep this client");
    expect(restored.concerns).toBe("Hurting the relationship vs staying stuck");
  });

  it("resolveInitial keeps conversationSuspended until explicit resume", () => {
    const filled = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    saveBoardIntakeDraft({ ...filled, conversationSuspended: true });
    const restored = resolveInitialBoardIntakeDraft([]);
    expect(restored.conversationSuspended).toBe(true);
    expect(restored.decision).toBe("Whether to keep this client");
  });

  it("resolveInitial does not overwrite an in-progress draft with empty defaults", () => {
    const filled = answerBoardIntakeStep(
      createEmptyBoardIntakeDraft(["board-chair"]),
      "Halfway decision",
    );
    saveBoardIntakeDraft(filled);
    const resolved = resolveInitialBoardIntakeDraft(["board-chair"]);
    expect(resolved.decision).toBe("Halfway decision");
    expect(resolved.currentStep).toBe("importance");
  });

  it("legacy answerIntakeStep still reaches completion after four answers", () => {
    let intake = createEmptyBoardDirectorIntake(["board-chair"]);
    intake = ensureChairInIntake(intake);
    intake = answerIntakeStep(intake, "Whether to expand into a new offer");
    intake = answerIntakeStep(intake, "Cash is tight and timing matters");
    intake = answerIntakeStep(intake, "Expand now, wait, or pilot");
    intake = answerIntakeStep(intake, "Capacity and brand risk");
    expect(isIntakeComplete(intake)).toBe(true);
    expect(intake.currentStep).toBe("review");
    const record = createBoardDirectorDiscussion(intake);
    expect(record.directorIds).toEqual(["board-chair"]);
  });

  it("setDraftStep to a question for Change an Answer does not clear other fields", () => {
    let d = answerAllQuestions(createEmptyBoardIntakeDraft(["board-chair"]));
    d = setDraftStep(d, "importance");
    expect(d.decision).toBeTruthy();
    expect(d.concerns).toBeTruthy();
    expect(d.currentStep).toBe("importance");
  });

  it("question step list is exactly four before review", () => {
    expect(BOARD_INTAKE_QUESTION_STEPS).toEqual([
      "decision",
      "importance",
      "options",
      "concerns",
    ]);
  });
});

describe("Board intake draft persistence storage key", () => {
  it("uses Board draft key — not a second history store", async () => {
    const { BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY, BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY } =
      await import("@/lib/board/boardDiscussion/boardDirectorDiscussion");
    expect(BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY).toContain("intake-draft");
    expect(BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY).not.toBe(
      BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY,
    );
  });
});
