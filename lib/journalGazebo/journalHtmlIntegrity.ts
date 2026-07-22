/**
 * Journal HTML integrity — save-time sanitization + human-readable retrieval.
 *
 * Root causes of corruption historically:
 * - contentEditable paste / dedication / overflow writing unsanitized HTML
 * - one-character-per-<p> vertical typing bugs
 * - zero-width caret spans and style soup leaking into quotes
 */

import {
  consolidateVerticalCharBlocks,
  plainTextFromHtml,
  sanitizePageHtml,
} from "./writingSurface";

const DANGEROUS_TAG_RE =
  /<\/?(?:script|style|iframe|object|embed|link|meta|form|input|textarea|svg|math)[^>]*>/gi;

const EVENT_ATTR_RE = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

/** CSS / editor crumbs that must never appear in member-facing quotes. */
const EDITOR_ARTIFACT_PLAIN_RE =
  /\b(?:font-family|font-size|text-shadow|line-height|letter-spacing|data-jg-styled|contenteditable|javascript:)\b/i;

const MARKUP_LEAK_RE = /<\/?[a-z][\s\S]*>/i;

/**
 * Sanitize journal page HTML before it enters localStorage / growth journal.
 * Safe to call from typing, autosave, paste, page-turn, dedication, and Save.
 */
export function sanitizeJournalHtmlForStorage(html: string): string {
  const raw = String(html ?? "");
  if (!raw.trim()) return "";

  if (typeof document === "undefined") {
    return sanitizeJournalHtmlWithoutDom(raw);
  }

  const root = document.createElement("div");
  root.innerHTML = raw;
  consolidateVerticalCharBlocks(root);
  stripEmptyZeroWidthRuns(root);

  let out = sanitizePageHtml(root.innerHTML);
  // Drop leftover caret markers — editor recreates them when needed.
  out = out.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");
  out = out.replace(/<span([^>]*)>\s*<\/span>/gi, "");
  out = out.replace(/(<p[^>]*>)\s*<\/p>/gi, "$1<br></p>");

  if (isMalformedJournalHtml(out) && !plainTextFromHtml(out).trim()) {
    return "";
  }
  return out;
}

/** DOM-free fallback for SSR / workers. */
export function sanitizeJournalHtmlWithoutDom(html: string): string {
  let out = String(html ?? "");
  // Remove dangerous elements and their contents (not just the tags).
  out = out.replace(
    /<(script|style|iframe|object|embed|link|meta|form|svg|math)\b[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  out = out.replace(
    /<(script|style|iframe|object|embed|link|meta|form|input|textarea|svg|math)\b[^>]*\/?>/gi,
    "",
  );
  out = out.replace(DANGEROUS_TAG_RE, "");
  out = out.replace(EVENT_ATTR_RE, "");
  out = out.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");
  // Collapse vertical one-char paragraphs without a DOM.
  out = out.replace(
    /(?:<p[^>]*>\s*([^<])\s*<\/p>\s*){2,}/gi,
    (match) => {
      const chars = [...match.matchAll(/<p[^>]*>\s*([^<])\s*<\/p>/gi)].map(
        (m) => m[1] ?? "",
      );
      if (chars.length < 2 || !chars.every((c) => c.length === 1)) return match;
      return `<p>${chars.join("")}</p>`;
    },
  );
  return out.trim();
}

function stripEmptyZeroWidthRuns(root: HTMLElement): void {
  for (const el of [...root.querySelectorAll("span, p, div")]) {
    const text = (el.textContent ?? "").replace(/[\u200B-\u200D\uFEFF\u2060\u00a0\s]/g, "");
    if (!text && el.childElementCount === 0) {
      if (el.tagName.toLowerCase() === "span") {
        el.remove();
      }
    }
  }
}

/** True when stored HTML looks damaged beyond safe rich text. */
export function isMalformedJournalHtml(html: string): boolean {
  const raw = String(html ?? "");
  if (!raw.trim()) return false;
  if (/<script|<iframe|javascript:/i.test(raw)) return true;
  // Unbalanced angle brackets with no recoverable text
  const plain = extractHumanReadableJournalText(raw, 4000);
  if (!plain && /<|>/.test(raw) && raw.length > 40) return true;
  // Style soup with almost no letters
  if (
    /font-family\s*:/i.test(raw) &&
    (plain?.replace(/[^a-zA-Z]/g, "").length ?? 0) < 8
  ) {
    return true;
  }
  return false;
}

/**
 * Extract human-readable journal text for quoting in chat / memory.
 * Returns null when the fragment is not safe to show a member.
 */
export function extractHumanReadableJournalText(
  raw: string,
  max = 220,
): string | null {
  const stripped = plainTextFromHtml(String(raw ?? ""))
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) return null;
  if (EDITOR_ARTIFACT_PLAIN_RE.test(stripped)) return null;
  if (MARKUP_LEAK_RE.test(stripped)) return null;
  if (!isHumanReadableJournalText(stripped)) return null;
  return stripped.slice(0, max);
}

/** Reject keyboard mash, CSS crumbs, and non-linguistic fragments. */
export function isHumanReadableJournalText(plain: string): boolean {
  const text = String(plain ?? "").trim();
  if (text.length < 12) return false;
  if (EDITOR_ARTIFACT_PLAIN_RE.test(text)) return false;
  if (MARKUP_LEAK_RE.test(text)) return false;
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 10) return false;
  const vowels = (letters.match(/[aeiouAEIOU]/g) ?? []).length;
  if (vowels / letters.length < 0.16) return false;
  // Reject long runs of identical characters (corruption / mash)
  if (/(.)\1{8,}/.test(text)) return false;
  return true;
}

/** Strip residual editor artifacts from a plain excerpt (defense in depth). */
export function scrubJournalQuoteForMember(text: string, max = 220): string {
  const readable = extractHumanReadableJournalText(text, max);
  if (readable) return readable;
  const fallback = String(text ?? "")
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (!isHumanReadableJournalText(fallback)) return "";
  if (EDITOR_ARTIFACT_PLAIN_RE.test(fallback)) return "";
  return fallback.slice(0, max);
}
