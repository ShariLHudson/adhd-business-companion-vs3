import { describe, expect, it } from "vitest";
import {
  resolveHomesteadChatMessages,
  shouldShowHomesteadConversation,
} from "@/lib/conversation/homesteadChatVisibility";

describe("homestead chat visibility", () => {
  it("calm home hides thread until first message", () => {
    expect(shouldShowHomesteadConversation(true, [], false)).toBe(false);
    expect(resolveHomesteadChatMessages(true, [], false)).toEqual([]);
  });

  it("shows thread immediately after member sends", () => {
    const messages = [{ role: "user", content: "help me create an SOP" }];
    expect(shouldShowHomesteadConversation(true, messages, false)).toBe(true);
    expect(resolveHomesteadChatMessages(true, messages, false)).toEqual(messages);
  });

  it("shows thread while loading even before messages flush", () => {
    expect(shouldShowHomesteadConversation(true, [], true)).toBe(true);
  });

  it("non-calm home always shows messages", () => {
    expect(resolveHomesteadChatMessages(false, [], false)).toEqual([]);
  });
});
