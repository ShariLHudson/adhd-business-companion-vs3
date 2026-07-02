import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { isChatEnterWithoutNewline, handleChatTextareaKeyDown } from "./chatInputKeyboard";

function keyEvent(
  init: Partial<{
    key: string;
    code: string;
    shiftKey: boolean;
    isComposing: boolean;
    keyCode: number;
  }>,
): KeyboardEvent<HTMLTextAreaElement> {
  return {
    key: init.key ?? "Enter",
    code: init.code ?? init.key ?? "Enter",
    shiftKey: init.shiftKey ?? false,
    preventDefault: vi.fn(),
    nativeEvent: { isComposing: init.isComposing ?? false },
    keyCode: init.keyCode ?? 13,
  } as unknown as KeyboardEvent<HTMLTextAreaElement>;
}

describe("chatInputKeyboard", () => {
  it("Enter sends immediately", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "Enter" });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "hello" },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: true });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onSend).toHaveBeenCalledWith("hello");
  });

  it("NumpadEnter sends immediately", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "NumpadEnter", code: "NumpadEnter" });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "hi" },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: true });
    expect(onSend).toHaveBeenCalledWith("hi");
  });

  it("keyCode 13 sends when key is unrecognized", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "", code: "", keyCode: 13 });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "test" },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: true });
    expect(onSend).toHaveBeenCalledWith("test");
  });

  it("Shift+Enter does not send", () => {
    const onSend = vi.fn();
    const onOtherKey = vi.fn();
    const e = keyEvent({ key: "Enter", shiftKey: true });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "hello" },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: true, onOtherKey });
    expect(onSend).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(onOtherKey).toHaveBeenCalled();
  });

  it("does not send when canSend is false", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "Enter" });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "hello" },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: false });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send empty textarea on Enter", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "Enter" });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "   " },
    });
    handleChatTextareaKeyDown(e, onSend, { canSend: true });
    expect(e.preventDefault).toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("IME composition Enter does not send", () => {
    const onSend = vi.fn();
    const e = keyEvent({ key: "Enter", isComposing: true });
    Object.defineProperty(e, "currentTarget", {
      value: { value: "hello" },
    });
    expect(isChatEnterWithoutNewline(e)).toBe(false);
    handleChatTextareaKeyDown(e, onSend, { canSend: true });
    expect(onSend).not.toHaveBeenCalled();
  });
});
