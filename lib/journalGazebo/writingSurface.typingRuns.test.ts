/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { JournalGazeboConfig } from "./types";
import {
  applyInkToSelection,
  applyTypingStyleToSelection,
  beginTypingRunAtCaret,
  emptyStyledPageHtml,
  restyleAllBlocksInEditor,
  stampWritingBlock,
  typingStyleFromConfig,
  type TypingStyle,
} from "./writingSurface";

function testConfig(overrides: Partial<JournalGazeboConfig> = {}): JournalGazeboConfig {
  return {
    id: "jg-test",
    name: "Test Journal",
    leatherColor: "espresso",
    embossedTitle: "Test",
    showSparkFlame: true,
    coverImageKind: "none",
    paperStyle: "cream",
    fontId: "merriweather",
    inkColor: "plum",
    penStyle: "gel",
    nibSize: "medium",
    writingFontSize: 18,
    writingMode: "silent",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function placeCaretAtEnd(editor: HTMLElement): void {
  const block = editor.querySelector("p") ?? editor;
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function selectAllTextIn(editor: HTMLElement): void {
  const block = editor.querySelector("p") ?? editor;
  const range = document.createRange();
  range.selectNodeContents(block);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

describe("journal typing runs preserve prior style", () => {
  let config: JournalGazeboConfig;
  let style: TypingStyle;
  let editor: HTMLDivElement;

  beforeEach(() => {
    config = testConfig();
    style = typingStyleFromConfig(config);
    editor = document.createElement("div");
    editor.contentEditable = "true";
    editor.innerHTML = emptyStyledPageHtml(config, style);
    document.body.appendChild(editor);
    editor.focus();
    const p = editor.querySelector("p")!;
    p.textContent = "Felt tip plum words";
    stampWritingBlock(p, config, style);
    placeCaretAtEnd(editor);
  });

  it("keeps original paragraph style when opening a new run after prefs change", () => {
    const originalHtml = editor.innerHTML;
    const next: TypingStyle = {
      ...style,
      writingFontSize: 20,
      penStyle: "fountain",
      inkColor: "navy",
      fontId: "lora",
    };

    beginTypingRunAtCaret(editor, config, next);

    const p = editor.querySelector("p")!;
    expect(p.getAttribute("data-pen")).toBe("gel");
    expect(p.getAttribute("data-ink")).toBe("plum");
    expect(p.getAttribute("data-font")).toBe("merriweather");
    expect(p.getAttribute("data-size")).toBe("18");
    expect(p.textContent).toContain("Felt tip plum words");

    const run = editor.querySelector("span[data-jg-styled]");
    expect(run).toBeTruthy();
    expect(run!.getAttribute("data-pen")).toBe("fountain");
    expect(run!.getAttribute("data-ink")).toBe("navy");
    expect(run!.getAttribute("data-font")).toBe("lora");
    expect(run!.getAttribute("data-size")).toBe("20");

    // Original inline style tokens should still be present on the paragraph.
    expect(originalHtml).toContain('data-pen="gel"');
    expect(p.getAttribute("style")).toContain("18px");
  });

  it("does not restyle prior text when active style matches current run", () => {
    beginTypingRunAtCaret(editor, config, style);
    expect(editor.querySelectorAll("span[data-jg-styled]").length).toBe(0);
    const p = editor.querySelector("p")!;
    expect(p.getAttribute("data-pen")).toBe("gel");
    expect(p.textContent).toBe("Felt tip plum words");
  });

  it("keeps the caret mid-word when the active style already matches", () => {
    const p = editor.querySelector("p")!;
    p.textContent = "hello world";
    stampWritingBlock(p, config, style);
    const text = p.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 5);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    beginTypingRunAtCaret(editor, config, style);

    expect(editor.querySelectorAll("span[data-jg-styled]").length).toBe(0);
    const after = window.getSelection();
    expect(after?.isCollapsed).toBe(true);
    expect(after?.anchorNode).toBe(text);
    expect(after?.anchorOffset).toBe(5);
  });

  it("applies a new style only to the selection", () => {
    selectAllTextIn(editor);
    const next: TypingStyle = { ...style, inkColor: "burgundy", writingFontSize: 22 };
    expect(applyTypingStyleToSelection(config, next)).toBe(true);

    const span = editor.querySelector("span[data-jg-styled]")!;
    expect(span.getAttribute("data-ink")).toBe("burgundy");
    expect(span.getAttribute("data-size")).toBe("22");
    expect(span.textContent).toBe("Felt tip plum words");
  });

  it("selection ink wrap leaves surrounding text alone when only part is selected", () => {
    const p = editor.querySelector("p")!;
    p.textContent = "keep this CHANGE that";
    stampWritingBlock(p, config, style);

    const text = p.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 10);
    range.setEnd(text, 16);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    applyInkToSelection("navy", config, { ...style, inkColor: "navy" });

    expect(p.textContent).toBe("keep this CHANGE that");
    const span = editor.querySelector("span[data-jg-styled]")!;
    expect(span.textContent).toBe("CHANGE");
    expect(span.getAttribute("data-ink")).toBe("navy");
    expect(p.getAttribute("data-ink")).toBe("plum");
  });

  it("restyleAllBlocksInEditor still rewrites everything (legacy / intentional)", () => {
    const next: TypingStyle = { ...style, inkColor: "navy", writingFontSize: 24 };
    restyleAllBlocksInEditor(editor, config, next);
    const p = editor.querySelector("p")!;
    expect(p.getAttribute("data-ink")).toBe("navy");
    expect(p.getAttribute("data-size")).toBe("24");
  });
});
