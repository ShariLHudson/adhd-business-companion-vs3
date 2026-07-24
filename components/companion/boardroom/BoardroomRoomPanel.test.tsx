/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardroomRoomPanel } from "@/components/companion/boardroom/BoardroomRoomPanel";
import {
  answerBoardIntakeStep,
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
  suspendBoardIntakeConversation,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { prepareCallTheBoard } from "@/lib/board/callTheBoard";

describe("BoardroomRoomPanel destination entry", () => {
  beforeEach(() => {
    clearBoardIntakeDraft();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  });

  it("direct navigation to Round Table opens boardroom_home seating overview", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-boardroom-view-mode="boardroom_home"');
    expect(html).toContain('data-testid="board-directors-meet-gallery"');
    expect(html).toContain('data-testid="round-table-overlay"');
    expect(html).toContain('data-testid="board-view-round-table"');
    expect(html).not.toContain('data-testid="boardroom-home"');
    expect(html).not.toMatch(/Start a Board Discussion|Board Discussion Intake/i);
  });

  it("first entry shows Round Table seating map", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-testid="round-table-overlay"');
    expect(html).toContain('data-testid="round-table-seat-');
    expect(html).toContain('aria-label="Chairs at the Round Table"');
  });

  it("re-entry after unfinished discussion still opens boardroom_home", () => {
    let d = createEmptyBoardIntakeDraft(["board-chair"]);
    d = answerBoardIntakeStep(d, "Should we expand?");
    saveBoardIntakeDraft(d);
    suspendBoardIntakeConversation();

    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-boardroom-view-mode="boardroom_home"');
    expect(html).toContain('data-testid="boardroom-resume-discussion-card"');
    expect(html).toContain("You have an unfinished Board discussion.");
    expect(html).toContain('data-testid="boardroom-resume-discussion"');
    expect(html).not.toContain("Should we expand?");
    expect(html).not.toMatch(/board-director-discussion-intake|Current question/i);
  });

  it("does not auto-open intake from sticky Call the Board on ordinary home", () => {
    prepareCallTheBoard({
      source: "project-home",
      projectName: "Newsletter",
      decisionSeed: "What next for Newsletter?",
    });
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-boardroom-view-mode="boardroom_home"');
    expect(html).not.toContain("What next for Newsletter?");
  });

  it("explicit intake intent still opens board discussion", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="intake" />,
    );
    expect(html).not.toContain('data-boardroom-view-mode="boardroom_home"');
    expect(html).toMatch(/board-director|Start a Board Discussion|Board Discussion/i);
  });

  it("direct Thomas entry opens director profile path", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="meet-thomas" />,
    );
    expect(html).toContain('data-testid="board-director-profile-board-chair"');
    expect(html).toContain("Thomas Ellison");
    expect(html).toMatch(/Back to Boardroom/);
  });

  it("direct past entry opens saved discussions", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="past" />,
    );
    expect(html).toContain('data-testid="boardroom-past-discussions"');
    expect(html).toContain("Back to Boardroom");
  });

  it("Board chat chrome is not mounted on boardroom_home", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel
        onBack={() => {}}
        entryIntent="home"
        shariChatOpen={false}
        thread={<div data-testid="boardroom-shari-thread">chat</div>}
        footer={<div data-testid="boardroom-shari-footer">footer</div>}
      />,
    );
    expect(html).not.toContain('data-testid="boardroom-shari-thread"');
    expect(html).not.toContain("boardroom-room__chat-panel");
  });
});
