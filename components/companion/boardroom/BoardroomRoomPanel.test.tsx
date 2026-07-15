/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BoardroomRoomPanel } from "@/components/companion/boardroom/BoardroomRoomPanel";
import {
  BOARDROOM_HOME_PRIMARY_CHOICES,
  BOARDROOM_WELCOME_MESSAGE,
} from "@/lib/boardroom";

describe("BoardroomRoomPanel home restoration", () => {
  it("normal entry renders Boardroom Home with welcome and three choices", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-testid="boardroom-home"');
    expect(html).toContain('data-testid="boardroom-welcome-message"');
    expect(html).toContain(BOARDROOM_WELCOME_MESSAGE);
    expect(html).toContain('data-testid="boardroom-primary-choices"');
    for (const choice of BOARDROOM_HOME_PRIMARY_CHOICES) {
      expect(html).toContain(`data-testid="${choice.testId}"`);
      expect(html).toContain(choice.title);
      expect(html).toContain(choice.description);
    }
    expect(html).toContain('data-testid="boardroom-how-to-use"');
    expect(html).toContain("How to Use the Boardroom");
    expect(html).not.toContain("Start a Board Discussion");
    expect(html).not.toContain('data-testid="boardroom-my-place-at-the-table"');
    expect(html).not.toContain('data-testid="board-director-profile-board-chair"');
    expect(html).toContain('data-testid="round-table-boardroom"');
  });

  it("does not auto-open Thomas on home entry", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="home" />,
    );
    expect(html).toContain('data-testid="boardroom-home"');
    expect(html).not.toContain('data-testid="board-directors-meet-gallery"');
    expect(html).not.toContain('data-testid="board-director-profile-board-chair"');
  });

  it("direct Thomas entry opens Meet Directors on Thomas profile path", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="meet-thomas" />,
    );
    expect(html).not.toContain('data-testid="boardroom-home"');
    expect(html).toContain('data-testid="board-director-profile-board-chair"');
    expect(html).toContain("Thomas Ellison");
    expect(html).toMatch(/Boardroom Home/);
  });

  it("direct intake entry opens Board discussion intake", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="intake" />,
    );
    expect(html).not.toContain('data-testid="boardroom-home"');
    expect(html).toMatch(/board-director|Start a Board Discussion|Board Discussion/i);
  });

  it("direct past entry opens history", () => {
    const html = renderToStaticMarkup(
      <BoardroomRoomPanel onBack={() => {}} entryIntent="past" />,
    );
    expect(html).toContain('data-testid="boardroom-past-discussions"');
    expect(html).toContain("Back to Boardroom Home");
  });
});
