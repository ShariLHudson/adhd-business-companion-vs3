/**
 * @vitest-environment jsdom
 *
 * Prompt 145 — skip optional placeholders, multi-director voices, Call the Board.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  buildBoardDiscussionTurns,
  buildChairOpeningAndSummary,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardIntakeDraft,
  formatOptionalAnswerForDisplay,
  skipBoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  buildCallTheBoardContext,
  prepareCallTheBoard,
  peekCallTheBoard,
} from "@/lib/board/callTheBoard";

describe("Prompt 145 Boardroom certification helpers", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  });

  it("never treats instructional placeholders as optional answers", () => {
    expect(formatOptionalAnswerForDisplay("")).toBeNull();
    expect(formatOptionalAnswerForDisplay("what matters most to you")).toBeNull();
    expect(formatOptionalAnswerForDisplay("Cash flow this quarter")).toBe(
      "Cash flow this quarter",
    );
  });

  it("Chair opening omits skipped optionals — no placeholder prose", () => {
    const turns = buildChairOpeningAndSummary(
      { decision: "Hire a VA?" },
      ["board-chair", "operations-capacity"],
    );
    const text = turns.map((t) => t.text).join("\n");
    expect(text).toContain("Hire a VA?");
    expect(text).not.toMatch(/what matters most to you/i);
    expect(text).not.toMatch(/the options you are weighing/i);
    expect(text).not.toMatch(/the concerns you are carrying/i);
    expect(text).toMatch(/No additional optional details were provided/i);
  });

  it("Skip Optional Details jumps to review and clears remaining fields", () => {
    let draft = {
      ...createEmptyBoardIntakeDraft(["customer-market"]),
      decision: "Raise prices?",
      currentStep: "importance" as const,
      importance: "stale",
      options: ["A"],
      concerns: "stale concern",
    };
    draft = skipBoardIntakeStep(draft);
    expect(draft.currentStep).toBe("review");
    expect(draft.decision).toBe("Raise prices?");
    expect(draft.importance).toBe("");
    expect(draft.options).toEqual([]);
    expect(draft.concerns).toBe("");
  });

  it("every selected non-Chair Director gets a spoken turn", () => {
    const turns = buildBoardDiscussionTurns(
      { decision: "Launch a newsletter?" },
      ["board-chair", "customer-market", "financial-stewardship"],
    );
    const directorTurns = turns.filter((t) => t.role === "director");
    expect(directorTurns.map((t) => t.directorId).sort()).toEqual([
      "customer-market",
      "financial-stewardship",
    ]);
    expect(directorTurns.every((t) => t.speakerName)).toBe(true);
    expect(turns.some((t) => t.role === "chair")).toBe(true);
  });

  it("Decision Record attaches Current Focus from source context", () => {
    const draft = {
      ...createEmptyBoardIntakeDraft(["customer-market"], {
        projectId: "proj-1",
        projectName: "Newsletter Launch",
        workTitle: "Launch a weekly newsletter for my small business.",
      }),
      decision: "Should I launch weekly?",
      currentStep: "review" as const,
    };
    const record = createBoardDirectorDiscussionFromDraft(draft);
    expect(record.decisionRecord?.relatedProjectName).toBe("Newsletter Launch");
    expect(record.sourceContext?.workTitle).toMatch(/newsletter/i);
    expect(record.turns.some((t) => t.role === "director")).toBe(true);
  });

  it("Call the Board seeds intake with project focus", () => {
    const payload = buildCallTheBoardContext({
      source: "project-home",
      projectId: "p1",
      projectName: "Newsletter",
      projectFocus: "Launch a weekly newsletter for my small business.",
    });
    prepareCallTheBoard(payload);
    expect(peekCallTheBoard()?.projectName).toBe("Newsletter");
    const stored = localStorage.getItem("spark.board.director-intake-draft.v1");
    expect(stored).toBeTruthy();
    const draft = JSON.parse(stored!);
    expect(draft.decision).toMatch(/newsletter/i);
    expect(draft.currentStep).toBe("review");
    expect(draft.sourceContext.projectId).toBe("p1");
  });
});
