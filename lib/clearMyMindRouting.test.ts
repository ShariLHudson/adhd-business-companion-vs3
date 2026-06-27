import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_SECTION,
  isClearMyMindSection,
  shouldOpenClearMyMindBesideChat,
  shouldOpenClearMyMindStandalone,
} from "./clearMyMindRouting";

describe("clearMyMindRouting", () => {
  it("uses brain-dump as the canonical section", () => {
    expect(CLEAR_MY_MIND_SECTION).toBe("brain-dump");
    expect(isClearMyMindSection("brain-dump")).toBe(true);
    expect(isClearMyMindSection("focus")).toBe(false);
  });

  it("always opens standalone — never beside chat", () => {
    expect(shouldOpenClearMyMindStandalone("brain-dump", "chat_beside")).toBe(
      true,
    );
    expect(shouldOpenClearMyMindStandalone("brain-dump", "nav_fullscreen")).toBe(
      true,
    );
    expect(shouldOpenClearMyMindBesideChat("brain-dump")).toBe(false);
  });
});
