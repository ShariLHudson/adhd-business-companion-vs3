/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardDirectorDiscussionIntake } from "@/components/companion/board/BoardDirectorDiscussionIntake";
import {
  answerBoardIntakeStep,
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

describe("BoardDirectorDiscussionIntake UI", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
  });

  it("restores review screen after remount when concerns were completed", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Keep or release a client");
    d = answerBoardIntakeStep(d, "Patterns keep repeating");
    d = answerBoardIntakeStep(d, "End\nRenegotiate\nContinue");
    d = answerBoardIntakeStep(d, "Hurting trust");
    expect(d.currentStep).toBe("review");
    saveBoardIntakeDraft(d);

    const html = renderToStaticMarkup(
      <BoardDirectorDiscussionIntake
        initialDirectorIds={["board-chair"]}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(html).toContain('data-testid="board-director-intake-review"');
    expect(html).toContain("Keep or release a client");
    expect(html).toContain("Patterns keep repeating");
    expect(html).toContain("Hurting trust");
    expect(html).toContain('data-testid="board-director-intake-begin"');
    expect(html).not.toContain("What decision are you considering?");
  });

  it("does not show decision prompt when draft is at review", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "A");
    d = answerBoardIntakeStep(d, "B");
    d = answerBoardIntakeStep(d, "C");
    d = answerBoardIntakeStep(d, "D");
    saveBoardIntakeDraft(d);
    const html = renderToStaticMarkup(
      <BoardDirectorDiscussionIntake
        initialDirectorIds={[]}
        onCancel={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(html).toContain("Before we begin");
    expect(html).not.toContain('data-testid="board-director-discussion-intake"');
  });
});
