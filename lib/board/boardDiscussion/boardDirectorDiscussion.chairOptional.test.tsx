/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardDirectorDiscussionIntake } from "@/components/companion/board/BoardDirectorDiscussionIntake";
import {
  canBeginBoardDiscussion,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardIntakeDraft,
  ensureChairInDraft,
  skipBoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

describe("Board discussion — Chair optional + Start Discussion", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
  });

  it("does not auto-insert Chair into selection", () => {
    const draft = createEmptyBoardIntakeDraft([
      "customer-market",
      "financial-stewardship",
    ]);
    const next = ensureChairInDraft(draft);
    expect(next.selectedDirectorIds).toEqual([
      "customer-market",
      "financial-stewardship",
    ]);
    expect(next.chairConfirmed).toBe(false);
  });

  it("can begin without Chair when topic + directors exist", () => {
    const draft = {
      ...createEmptyBoardIntakeDraft(["customer-market"]),
      decision: "Should I raise prices?",
      currentStep: "review" as const,
    };
    expect(canBeginBoardDiscussion(draft)).toBe(true);
    const record = createBoardDirectorDiscussionFromDraft(draft);
    expect(record.directorIds).toEqual(["customer-market"]);
    expect(record.directorIds).not.toContain("board-chair");
    expect(record.turns.some((t) => t.role === "moderator")).toBe(true);
    expect(record.turns.every((t) => t.role !== "chair")).toBe(true);
  });

  it("skip optional advances without clearing decision", () => {
    let draft = {
      ...createEmptyBoardIntakeDraft(["customer-market"]),
      decision: "Hire or wait",
      currentStep: "importance" as const,
    };
    draft = skipBoardIntakeStep(draft);
    expect(draft.decision).toBe("Hire or wait");
    expect(draft.currentStep).toBe("review");
  });

  it("intake shows decision prompt — never Chair-required dead-end", () => {
    const html = renderToStaticMarkup(
      <BoardDirectorDiscussionIntake
        initialDirectorIds={["customer-market"]}
        forceFreshDecision
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(html).not.toContain("The Chair is required");
    expect(html).not.toContain('data-testid="board-director-chair-confirm"');
    expect(html).toContain('data-testid="board-director-discussion-intake"');
    expect(html).toMatch(/decision, situation, or question/i);
  });

  it("Meet path preserves selected Directors on intake", () => {
    const html = renderToStaticMarkup(
      <BoardDirectorDiscussionIntake
        initialDirectorIds={["customer-market", "technology-future"]}
        forceFreshDecision
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(html).toContain("Selected Directors:");
    expect(html).toMatch(/Sofia|Maya|Customer|Market|Technology|Future/i);
  });
});
