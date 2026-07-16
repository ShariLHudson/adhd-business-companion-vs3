/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { scrollRoomListToTestId } from "./scrollRoomList";

describe("scrollRoomListToTestId", () => {
  it("scrolls the morning-room scroller to the target", () => {
    document.body.innerHTML = `
      <div class="plan-my-day-morning-room__scroll" style="height:100px;overflow:auto">
        <div style="height:400px"></div>
        <div data-testid="reminders-recurring">Recurring</div>
      </div>
    `;
    const scroller = document.querySelector(
      ".plan-my-day-morning-room__scroll",
    ) as HTMLElement;
    const scrollTo = vi.fn();
    scroller.scrollTo = scrollTo as typeof scroller.scrollTo;

    scrollRoomListToTestId("reminders-recurring");
    expect(scrollTo).toHaveBeenCalled();
  });
});
