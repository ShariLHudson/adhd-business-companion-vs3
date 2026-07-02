import { describe, expect, it } from "vitest";
import {
  CHAT_THINKING_LABEL,
  chatVisibleThinkingCopy,
  shouldShowChatVisibleThinking,
} from "./chatThinkingUi";

describe("chatThinkingUi", () => {
  it("always shows a single thinking label", () => {
    expect(chatVisibleThinkingCopy(null)).toBe(CHAT_THINKING_LABEL);
    expect(chatVisibleThinkingCopy("Still with you.")).toBe(CHAT_THINKING_LABEL);
  });
  it("hides visible thinking while awaiting a confirmation answer", () => {
    expect(shouldShowChatVisibleThinking(true, "Still with you.", true)).toBe(
      false,
    );
  });

  it("shows visible thinking only while loading when not awaiting confirmation", () => {
    expect(shouldShowChatVisibleThinking(true, "Thinking…", false)).toBe(
      true,
    );
    expect(shouldShowChatVisibleThinking(false, "Thinking…", false)).toBe(
      false,
    );
  });
});
