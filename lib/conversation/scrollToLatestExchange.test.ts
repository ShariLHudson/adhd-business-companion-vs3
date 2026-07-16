/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import {
  findLatestConversationAnchor,
  scrollConversationToLatestExchange,
} from "./scrollToLatestExchange";

describe("scrollConversationToLatestExchange", () => {
  it("prefers the latest assistant anchor over older thread items", () => {
    document.body.innerHTML = `
      <div class="scroller">
        <ul class="companion-chat-thread">
          <li class="companion-chat-thread__item">older</li>
          <li
            class="companion-chat-thread__item"
            data-conversation-exchange="latest"
            data-conversation-latest-assistant
          >latest assistant</li>
        </ul>
      </div>
    `;
    const scroller = document.querySelector(".scroller") as HTMLElement;
    const anchor = findLatestConversationAnchor(scroller);
    expect(anchor?.textContent?.trim()).toBe("latest assistant");
  });

  it("scrolls so the latest exchange aligns to the top of the scrollport", () => {
    document.body.innerHTML = `
      <div class="scroller" style="height:100px;overflow:auto">
        <div style="height:300px">padding</div>
        <div data-conversation-exchange="latest" data-conversation-latest-assistant>
          Start of Shari's reply
        </div>
        <div style="height:400px">rest of long reply</div>
      </div>
    `;
    const scroller = document.querySelector(".scroller") as HTMLElement;
    Object.defineProperty(scroller, "scrollTop", {
      writable: true,
      value: 9999,
    });
    const scrollTo = vi.fn();
    scroller.scrollTo = scrollTo as typeof scroller.scrollTo;

    scrollConversationToLatestExchange(scroller);

    expect(scrollTo).toHaveBeenCalled();
    const arg = scrollTo.mock.calls[0]?.[0] as { top: number };
    expect(arg.top).toBeGreaterThanOrEqual(0);
    // Must not pin to the absolute bottom (scrollHeight).
    expect(arg.top).not.toBe(scroller.scrollHeight);
  });

  it("scrolls to top when there is no conversation anchor", () => {
    document.body.innerHTML = `<div class="scroller"></div>`;
    const scroller = document.querySelector(".scroller") as HTMLElement;
    const scrollTo = vi.fn();
    scroller.scrollTo = scrollTo as typeof scroller.scrollTo;

    scrollConversationToLatestExchange(scroller);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
