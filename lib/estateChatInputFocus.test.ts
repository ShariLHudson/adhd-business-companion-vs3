// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  canAutoFocusEstateChatInput,
  isEstateChatInputElement,
  isUserEditingEstateDocument,
  shouldRoutePrintableKeyToChatInput,
} from "./estateChatInputFocus";

function setActiveElement(el: Element | null) {
  Object.defineProperty(document, "activeElement", {
    configurable: true,
    value: el,
  });
}

afterEach(() => {
  setActiveElement(document.body);
});

describe("estateChatInputFocus", () => {
  it("identifies chat input by data attribute", () => {
    const el = document.createElement("textarea");
    el.setAttribute("data-estate-chat-input", "true");
    expect(isEstateChatInputElement(el)).toBe(true);
  });

  it("does not auto-focus when another textarea is active", () => {
    const chat = document.createElement("textarea");
    chat.setAttribute("data-estate-chat-input", "true");
    const journal = document.createElement("textarea");
    document.body.append(chat, journal);
    journal.focus();
    setActiveElement(journal);
    expect(isUserEditingEstateDocument(chat)).toBe(true);
    expect(canAutoFocusEstateChatInput(chat)).toBe(false);
    chat.remove();
    journal.remove();
  });

  it("does not auto-focus inside document editor shell", () => {
    const chat = document.createElement("textarea");
    chat.setAttribute("data-estate-chat-input", "true");
    const shell = document.createElement("div");
    shell.setAttribute("data-estate-document-editor", "true");
    const inner = document.createElement("div");
    inner.contentEditable = "true";
    shell.append(inner);
    document.body.append(chat, shell);
    inner.focus();
    setActiveElement(inner);
    expect(isUserEditingEstateDocument(chat)).toBe(true);
    chat.remove();
    shell.remove();
  });

  it("allows printable keys when no document editor is active", () => {
    const chat = document.createElement("textarea");
    chat.setAttribute("data-estate-chat-input", "true");
    document.body.append(chat);
    const event = new KeyboardEvent("keydown", { key: "h", bubbles: true });
    expect(shouldRoutePrintableKeyToChatInput(event, chat)).toBe(true);
    chat.remove();
  });

  it("blocks printable keys when contenteditable is focused", () => {
    const chat = document.createElement("textarea");
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    document.body.append(chat, editor);
    setActiveElement(editor);
    const event = new KeyboardEvent("keydown", { key: "h", bubbles: true });
    expect(shouldRoutePrintableKeyToChatInput(event, chat)).toBe(false);
    chat.remove();
    editor.remove();
  });
});
