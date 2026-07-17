/**
 * Plain-language formatting — conversational UI, not markdown documents.
 * Use for prompts (what the model should output) and display (what users see).
 */

import { structureMultiItemResponse } from "./structureMultiItemResponse";

export { structureMultiItemResponse } from "./structureMultiItemResponse";

export const PLAIN_LANGUAGE_FORMATTING_RULE = `PLAIN LANGUAGE FORMATTING (mandatory for every user-facing message):
Do NOT use markdown heading syntax (#, ##, ###), horizontal rules (---), decorative dividers (///), or document-style section breaks.
Do NOT use **bold** or other markdown emphasis in user-facing copy.
Use plain language, short paragraphs, natural spacing, and simple bullet lists when needed (• item).
Use sentence-case labels only when a short heading helps — never hash prefixes.

MULTI-ITEM RESPONSES (mandatory):
When giving several steps, choices, examples, recommendations, considerations, or pros and cons, separate them visibly.
Never place a numbered list inside one continuous paragraph.
Prefer:
A short natural opening.

1. First item
Short explanation.

2. Second item
Short explanation.

One warm, specific closing question.

Not:
Here are key points: 1. First… 2. Second… 3. Third… all in one paragraph.
Do not turn every reply into a list — empathy, one direct answer, and simple explanations stay as ordinary paragraphs.
Openings should sound like Shari (calm, human), not like "Planning X is crucial for maximizing value…"
Closings should be context-aware ("Which part feels most important first?") — not a generic "Would you like to dive deeper into any of these areas?" every time.

Prefer:
Welcome back

What would you like to work on today?

• Finish the newsletter
• Review the workshop outline

Not:
### Welcome Back
---
What would you like to work on today?
---
The companion should feel conversational, calm, and human — not technical, markdown-based, or document-like.`;

/** Injected into system prompts (companion, founder, generate, coaching). */
export function plainLanguageFormattingHintForPrompt(): string {
  return PLAIN_LANGUAGE_FORMATTING_RULE;
}

/**
 * Normalize assistant/system copy for display — strips markdown headings,
 * separators, and emphasis markers the UI should not show literally.
 */
export function toPlainLanguageDisplay(text: string): string {
  if (!text) return "";

  // Rendering safeguard first — expand crushed inline lists while code/links intact.
  let out = structureMultiItemResponse(text.replace(/\r\n/g, "\n"));

  // Decorative separator lines
  out = out.replace(/^\s*---+\s*$/gm, "");
  out = out.replace(/^\s*\/\/\/+\s*$/gm, "");

  // Heading hashes at line start
  out = out.replace(/^#{1,6}\s+/gm, "");

  // Bold / underscore emphasis
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/__([^_]+)__/g, "$1");

  // Stray markers
  out = out.replace(/\*\*/g, "");
  out = out.replace(/`/g, "");

  // Markdown bullets → simple bullets
  out = out.replace(/^[\t ]*[-*]\s+/gm, "• ");

  out = out
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return out;
}

/** Split assistant text into paragraphs after plain-language cleanup. */
export function formatAssistantParagraphs(content: string): string[] {
  return toPlainLanguageDisplay(content)
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
