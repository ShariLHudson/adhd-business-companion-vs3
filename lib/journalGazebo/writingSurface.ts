import { appendJournalDictationText } from "./journalDictation";
import { JOURNAL_FONT_OPTIONS, JOURNAL_INK_OPTIONS } from "./catalog";
import { penRenderProfile } from "./penRender";
import type {
  JournalFontId,
  JournalGazeboConfig,
  JournalInkColor,
  JournalNibSize,
  JournalPenStyle,
} from "./types";

export const WRITING_FONT_SIZES = [14, 16, 18, 20, 22, 24, 28] as const;
export const DEFAULT_WRITING_FONT_SIZE = 18;

export function resolveWritingFontSize(config: JournalGazeboConfig): number {
  const size = config.writingFontSize ?? DEFAULT_WRITING_FONT_SIZE;
  return WRITING_FONT_SIZES.includes(size as (typeof WRITING_FONT_SIZES)[number])
    ? size
    : DEFAULT_WRITING_FONT_SIZE;
}

export function writingLineHeightPx(fontSize: number): number {
  return Math.round(fontSize * 1.45);
}

export function inkCssFor(inkId: string): string {
  return JOURNAL_INK_OPTIONS.find((ink) => ink.id === inkId)?.css ?? "#1c1816";
}

export function fontFamilyFor(fontId: JournalFontId): string {
  return (
    JOURNAL_FONT_OPTIONS.find((font) => font.id === fontId)?.family ??
    JOURNAL_FONT_OPTIONS[1]!.family
  );
}

export type TypingStyle = {
  fontId: JournalFontId;
  inkColor: JournalInkColor;
  writingFontSize: number;
  penStyle: JournalPenStyle;
  nibSize: JournalNibSize;
};

export function typingStyleFromConfig(config: JournalGazeboConfig): TypingStyle {
  return {
    fontId: config.fontId,
    inkColor: config.inkColor,
    writingFontSize: resolveWritingFontSize(config),
    penStyle: config.penStyle,
    nibSize: config.nibSize,
  };
}

function configWithTypingStyle(config: JournalGazeboConfig, style: TypingStyle): JournalGazeboConfig {
  return { ...config, ...style, writingFontSize: style.writingFontSize };
}

/** Inline styles baked into each paragraph — not inherited from the page root. */
export function blockInlineStyle(config: JournalGazeboConfig, style: TypingStyle): string {
  const pen = penRenderProfile(configWithTypingStyle(config, style));
  const lineHeight = writingLineHeightPx(style.writingFontSize);
  const parts = [
    `font-family: ${fontFamilyFor(style.fontId)}`,
    `font-size: ${style.writingFontSize}px`,
    `line-height: ${lineHeight}px`,
    `color: ${pen.inkColor}`,
    `font-weight: ${pen.fontWeight}`,
    `letter-spacing: ${pen.letterSpacing}`,
    `opacity: ${pen.opacity}`,
  ];
  if (pen.textShadow && pen.textShadow !== "none") {
    parts.push(`text-shadow: ${pen.textShadow}`);
  }
  if (pen.filter && pen.filter !== "none") {
    parts.push(`filter: ${pen.filter}`);
  }
  if (pen.webkitTextStroke && pen.webkitTextStroke !== "0") {
    parts.push(`-webkit-text-stroke: ${pen.webkitTextStroke}`);
    parts.push("paint-order: stroke fill");
  }
  return parts.join("; ");
}

function blockOpenTag(config: JournalGazeboConfig, style: TypingStyle): string {
  const inline = blockInlineStyle(config, style);
  return `<p style="${inline}" data-pen="${style.penStyle}" data-nib="${style.nibSize}" data-jg-styled="true">`;
}

export function emptyStyledPageHtml(
  config: JournalGazeboConfig,
  style?: TypingStyle,
): string {
  const resolved = style ?? typingStyleFromConfig(config);
  return `${blockOpenTag(config, resolved)}<br></p>`;
}

function styledParagraphHtml(
  config: JournalGazeboConfig,
  style: TypingStyle,
  text: string,
): string {
  if (!text) return `${blockOpenTag(config, style)}<br></p>`;
  return `${blockOpenTag(config, style)}${escText(text)}</p>`;
}

function pageHasInlineTypography(html: string): boolean {
  return /data-jg-styled/i.test(html) || /style="[^"]*font-family/i.test(html);
}

function escText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const ALLOWED_TAGS = new Set([
  "b",
  "i",
  "u",
  "strong",
  "em",
  "br",
  "p",
  "div",
  "span",
]);

const ALLOWED_STYLE_PROPS = new Set([
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "color",
  "letter-spacing",
  "line-height",
  "opacity",
  "text-shadow",
  "filter",
  "-webkit-text-stroke",
  "paint-order",
]);

function sanitizeStyle(style: string): string {
  const parts = style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const safe: string[] = [];
  for (const part of parts) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (/javascript|expression|url\s*\(/i.test(value)) continue;
    safe.push(`${prop}: ${value}`);
  }
  return safe.join("; ");
}

/** Strip unsafe markup while keeping basic formatting. */
export function sanitizePageHtml(html: string): string {
  if (!html || typeof document === "undefined") return html;
  const root = document.createElement("div");
  root.innerHTML = html;

  function walk(node: Node): void {
    const children = [...node.childNodes];
    for (const child of children) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        while (el.firstChild) {
          el.parentNode?.insertBefore(el.firstChild, el);
        }
        el.remove();
        continue;
      }
      for (const attr of [...el.attributes]) {
        if (attr.name.startsWith("on")) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (
          attr.name === "data-pen" ||
          attr.name === "data-nib" ||
          attr.name === "data-jg-styled"
        ) {
          continue;
        }
        if (attr.name === "style") {
          const cleaned = sanitizeStyle(attr.value);
          if (cleaned) el.setAttribute("style", cleaned);
          else el.removeAttribute("style");
        }
      }
      walk(el);
    }
  }

  walk(root);
  return root.innerHTML;
}

/** Convert legacy plain-text pages to safe HTML with per-paragraph styles. */
export function bodyToHtml(
  body: string,
  config?: JournalGazeboConfig,
  style?: TypingStyle,
): string {
  if (!body) return config ? emptyStyledPageHtml(config, style) : "";
  if (/<[a-z][\s\S]*>/i.test(body)) return migratePageHtml(body, config, style);
  if (!config) {
    return body
      .split("\n")
      .map((line) => (line === "" ? "<br>" : escText(line)))
      .join("<br>");
  }
  const resolved = style ?? typingStyleFromConfig(config);
  return body
    .split("\n")
    .map((line) => styledParagraphHtml(config, resolved, line))
    .join("");
}

/** Ensure each paragraph keeps its own typography; legacy pages migrate once. */
export function migratePageHtml(
  html: string,
  config?: JournalGazeboConfig,
  style?: TypingStyle,
): string {
  if (!html) return config ? emptyStyledPageHtml(config, style) : "";
  if (pageHasInlineTypography(html)) return sanitizePageHtml(html);
  if (!config) return sanitizePageHtml(html);

  const plain = plainTextFromHtml(html);
  if (!plain.trim()) return emptyStyledPageHtml(config, style);

  const resolved = style ?? typingStyleFromConfig(config);
  const lines = plain.split("\n");
  if (lines.length === 0) return emptyStyledPageHtml(config, style);
  return lines.map((line) => styledParagraphHtml(config, resolved, line)).join("");
}

export function plainTextFromHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
  }
  const div = document.createElement("div");
  div.innerHTML = bodyToHtml(html);
  return div.innerText ?? div.textContent ?? "";
}

export function appendDictationToBody(
  currentBody: string,
  spoken: string,
  config?: JournalGazeboConfig,
  style?: TypingStyle,
): string {
  const plain = plainTextFromHtml(currentBody);
  const merged = appendJournalDictationText(plain, spoken);
  if (!currentBody || !/<[a-z]/i.test(currentBody)) {
    return bodyToHtml(merged, config, style);
  }
  const added = merged.slice(plain.length);
  if (!added) return currentBody;
  if (!config) return `${currentBody}${escText(added)}`;
  const resolved = style ?? typingStyleFromConfig(config);
  const inline = blockInlineStyle(config, resolved);
  return `${currentBody}<span style="${inline}" data-pen="${resolved.penStyle}" data-nib="${resolved.nibSize}">${escText(added)}</span>`;
}

/** Root chrome only — typography lives on each paragraph. */
export function writingSurfaceChromeStyle(): Record<string, string> {
  return {
    caretColor: "#5a4e42",
  };
}

/** Lined paper — rhythm only; ink/font stay on each paragraph. */
export function ruledPaperStyle(
  config: JournalGazeboConfig,
  style?: TypingStyle,
): Record<string, string> {
  const fontSize = style?.writingFontSize ?? resolveWritingFontSize(config);
  return {
    "--jg-writing-line-height": `${writingLineHeightPx(fontSize)}px`,
  };
}

/** @deprecated Use writingSurfaceChromeStyle — block styles hold typography. */
export function writingSurfaceStyle(config: JournalGazeboConfig): Record<string, string> {
  return ruledPaperStyle(config);
}

export type WritingFormatCommand = "bold" | "italic" | "underline";

export function execWritingFormat(command: WritingFormatCommand): void {
  document.execCommand(command, false);
}

export function focusWritingSurface(el: HTMLElement | null): void {
  if (!el) return;
  focusEditableAtStart(el);
}

/** One empty paragraph so typing flows horizontally across the page. */
export function ensureDedicationEditorShell(editor: HTMLElement): void {
  const text = (editor.textContent ?? "").replace(/\u00a0/g, " ").trim();
  if (!text && !editor.querySelector("p, div, .jg-writing-block")) {
    editor.innerHTML = '<p><br></p>';
  }
}

export function focusEditableAtStart(editor: HTMLElement): void {
  editor.focus();
  const block =
    editor.querySelector<HTMLElement>("p, .jg-writing-block, div") ?? editor;
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function focusWritingAtPageStart(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style?: TypingStyle,
): void {
  ensureEditorShell(editor, config, style);
  focusEditableAtStart(editor);
}

export function findWritingBlock(node: Node | null, editor: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  let candidate: HTMLElement | null = null;
  while (current && current !== editor) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "p" || tag === "div") {
        candidate = el;
      }
    }
    current = current.parentNode;
  }
  return candidate;
}

export function isEmptyWritingBlock(block: HTMLElement): boolean {
  const text = (block.textContent ?? "").replace(/\u00a0/g, " ").trim();
  return text.length === 0;
}

export function stampWritingBlock(
  block: HTMLElement,
  config: JournalGazeboConfig,
  style: TypingStyle,
): void {
  block.setAttribute("style", blockInlineStyle(config, style));
  block.setAttribute("data-pen", style.penStyle);
  block.setAttribute("data-nib", style.nibSize);
  block.setAttribute("data-jg-styled", "true");
  if (block.tagName.toLowerCase() === "div") {
    block.classList.add("jg-writing-block");
  }
}

export function ensureEditorShell(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style?: TypingStyle,
): void {
  const text = (editor.textContent ?? "").replace(/\u00a0/g, " ").trim();
  if (!text && !editor.querySelector("[data-jg-styled]")) {
    editor.innerHTML = emptyStyledPageHtml(config, style);
  }
}

export function stampActiveBlockOnInput(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style: TypingStyle,
): HTMLElement | null {
  const selection = window.getSelection();
  const block = findWritingBlock(selection?.anchorNode ?? null, editor);
  if (!block || block.getAttribute("data-jg-styled") === "true") return block;
  stampWritingBlock(block, config, style);
  return block;
}

/** When writing prefs change — restyle the empty paragraph under the cursor. */
export function refreshEmptyActiveBlock(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style: TypingStyle,
): HTMLElement | null {
  const selection = window.getSelection();
  const block = findWritingBlock(selection?.anchorNode ?? null, editor);
  if (!block || !isEmptyWritingBlock(block)) return null;
  stampWritingBlock(block, config, style);
  return block;
}

/** Restyle every paragraph on the page — ink, pen, and size feel immediate. */
export function restyleAllBlocksInEditor(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style: TypingStyle,
): void {
  const blocks = editor.querySelectorAll<HTMLElement>("p, .jg-writing-block");
  if (blocks.length === 0) {
    ensureEditorShell(editor, config, style);
    const first = editor.querySelector<HTMLElement>("p, .jg-writing-block");
    if (first) stampWritingBlock(first, config, style);
    return;
  }
  for (const block of blocks) {
    stampWritingBlock(block, config, style);
  }
  for (const span of editor.querySelectorAll<HTMLElement>("span[data-jg-styled]")) {
    span.setAttribute("style", blockInlineStyle(config, style));
    span.setAttribute("data-pen", style.penStyle);
    span.setAttribute("data-nib", style.nibSize);
  }
}

/**
 * Repair one-character-per-line DOM (legacy bug) — merge into a single paragraph.
 */
export function consolidateVerticalCharBlocks(editor: HTMLElement): boolean {
  const blocks = [...editor.querySelectorAll<HTMLElement>("p, .jg-writing-block")];
  if (blocks.length < 2) return false;
  const texts = blocks.map((block) => (block.textContent ?? "").replace(/\u00a0/g, ""));
  const nonEmpty = texts.filter((text) => text.length > 0);
  if (nonEmpty.length < 2) return false;
  if (!nonEmpty.every((text) => text.length === 1)) return false;

  const first = blocks[0]!;
  first.textContent = texts.join("");
  for (let i = 1; i < blocks.length; i += 1) {
    blocks[i]!.remove();
  }
  return true;
}

/** Prepare the cursor block — never split mid-page into a new line per keystroke. */
export function prepareActiveBlockForTypingStyle(
  editor: HTMLElement,
  config: JournalGazeboConfig,
  style: TypingStyle,
): HTMLElement | null {
  consolidateVerticalCharBlocks(editor);
  const selection = window.getSelection();
  const block = findWritingBlock(selection?.anchorNode ?? null, editor);
  if (!block) {
    ensureEditorShell(editor, config, style);
    const first = editor.querySelector("p, .jg-writing-block") as HTMLElement | null;
    if (first) stampWritingBlock(first, config, style);
    return first;
  }
  stampWritingBlock(block, config, style);
  return block;
}

function wrapSelectionWithStyle(
  config: JournalGazeboConfig,
  style: TypingStyle,
  extra?: Partial<CSSStyleDeclaration>,
): boolean {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.setAttribute("style", blockInlineStyle(config, style));
  span.setAttribute("data-pen", style.penStyle);
  span.setAttribute("data-nib", style.nibSize);
  span.setAttribute("data-jg-styled", "true");
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) (span.style as unknown as Record<string, string>)[key] = String(value);
    }
  }
  try {
    range.surroundContents(span);
    return true;
  } catch {
    const text = range.toString();
    if (!text) return false;
    range.deleteContents();
    span.textContent = text;
    range.insertNode(span);
    return true;
  }
}

export function applyFontToSelection(fontId: JournalFontId, config?: JournalGazeboConfig, style?: TypingStyle): void {
  const family = fontFamilyFor(fontId);
  if (config && style && wrapSelectionWithStyle(config, { ...style, fontId }, { fontFamily: family })) {
    return;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.fontFamily = family;
  try {
    range.surroundContents(span);
  } catch {
    document.execCommand("fontName", false, family);
  }
}

export function applyInkToSelection(
  inkColor: JournalInkColor,
  config: JournalGazeboConfig,
  style: TypingStyle,
): void {
  const next = { ...style, inkColor };
  wrapSelectionWithStyle(config, next);
}

export function applyPenToSelection(
  penStyle: JournalPenStyle,
  config: JournalGazeboConfig,
  style: TypingStyle,
): void {
  const next = { ...style, penStyle };
  wrapSelectionWithStyle(config, next);
}

function lastTextNodeIn(root: HTMLElement): Text | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  while (walker.nextNode()) last = walker.currentNode as Text;
  return last;
}

function peelLastCharacter(root: HTMLElement): string | null {
  const node = lastTextNodeIn(root);
  if (!node?.data.length) return null;
  const ch = node.data.slice(-1);
  node.data = node.data.slice(0, -1);
  return ch;
}

function removeEmptyTailBlocks(editor: HTMLElement): void {
  while (editor.lastElementChild) {
    const el = editor.lastElementChild as HTMLElement;
    const text = (el.textContent ?? "").replace(/\u00a0/g, " ").trim();
    if (text || el.querySelector("img, br")) break;
    el.remove();
  }
}

/**
 * Peel overflow from the end of a fixed-height editor until it fits.
 * Returns HTML to continue on the next page.
 */
export function peelEditorOverflow(editor: HTMLElement): string | null {
  if (editor.clientHeight < 120 || editor.clientWidth < 120) return null;
  if (editor.scrollHeight <= editor.clientHeight + 24) return null;

  const overflow = document.createElement("div");
  let guard = 0;

  while (editor.scrollHeight > editor.clientHeight + 2 && guard < 12000) {
    guard += 1;
    removeEmptyTailBlocks(editor);
    if (editor.scrollHeight <= editor.clientHeight + 2) break;

    const ch = peelLastCharacter(editor);
    if (ch) {
      overflow.insertBefore(document.createTextNode(ch), overflow.firstChild);
      continue;
    }

    const last = editor.lastElementChild;
    if (!last) break;
    overflow.insertBefore(last.cloneNode(true), overflow.firstChild);
    last.remove();
  }

  removeEmptyTailBlocks(editor);
  const html = overflow.innerHTML.trim();
  return html || null;
}
