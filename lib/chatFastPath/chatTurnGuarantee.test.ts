import { describe, expect, it } from "vitest";
import {
  buildFailSafeChatReply,
  isInformationalChatTurn,
} from "./chatTurnGuarantee";

describe("chat turn guarantee", () => {
  it("1. what is the best way to start an SOP → informational fast path", () => {
    expect(
      isInformationalChatTurn("what is the best way to start an SOP"),
    ).toBe(true);
  });

  it("2. how do I write a proposal → informational fast path", () => {
    expect(isInformationalChatTurn("how do I write a proposal")).toBe(true);
  });

  it("3. help me plan my day → informational fast path", () => {
    expect(isInformationalChatTurn("help me plan my day")).toBe(true);
  });

  it("take me to the greenhouse → not informational (estate may route)", () => {
    expect(isInformationalChatTurn("take me to the greenhouse")).toBe(false);
  });

  it("fail-safe always returns non-empty copy", () => {
    const reply = buildFailSafeChatReply("there is one off property");
    expect(reply.trim().length).toBeGreaterThan(10);
  });
});
