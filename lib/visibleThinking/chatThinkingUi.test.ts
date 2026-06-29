import { describe, expect, it } from "vitest";
import {
  identityBarShowsThinkingCopy,
  chatVisibleThinkingCopy,
  shouldShowChatVisibleThinking,
} from "./chatThinkingUi";

describe("Visible Thinking chat UI", () => {
  it("shows thinking bubble while loading", () => {
    expect(shouldShowChatVisibleThinking(true, "Connecting a few dots...")).toBe(
      true,
    );
    expect(shouldShowChatVisibleThinking(false, "Connecting a few dots...")).toBe(
      false,
    );
    expect(shouldShowChatVisibleThinking(true, null)).toBe(true);
    expect(shouldShowChatVisibleThinking(true, "   ")).toBe(true);
  });

  it("uses fallback copy until adaptive thinking lines appear", () => {
    expect(chatVisibleThinkingCopy(null)).toBe("…");
    expect(chatVisibleThinkingCopy("One moment...")).toBe("One moment...");
  });

  it("hides thinking bubble after the assistant response (loading ends)", () => {
    expect(
      shouldShowChatVisibleThinking(false, "I want to answer this well."),
    ).toBe(false);
  });

  it("keeps Identity Bar from duplicating thinking copy", () => {
    expect(
      identityBarShowsThinkingCopy(true, "Connecting a few dots..."),
    ).toBe(false);
  });

  it("leaves chat input conceptually usable after failure (not loading)", () => {
    const inputDisabledWhileLoading = shouldShowChatVisibleThinking(
      true,
      "One moment...",
    );
    const inputUsableAfterFailure = !shouldShowChatVisibleThinking(
      false,
      "One moment...",
    );
    expect(inputDisabledWhileLoading).toBe(true);
    expect(inputUsableAfterFailure).toBe(true);
  });
});
