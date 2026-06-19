/**
 * Plain-language formatting — conversational UI, not markdown documents.
 * Use for prompts (what the model should output) and display (what users see).
 */

export const PLAIN_LANGUAGE_FORMATTING_RULE = `PLAIN LANGUAGE FORMATTING (mandatory for every user-facing message):
Do NOT use markdown heading syntax (#, ##, ###), horizontal rules (---), decorative dividers (///), or document-style section breaks.
Do NOT use **bold** or other markdown emphasis in user-facing copy.
Use plain language, short paragraphs, natural spacing, and simple bullet lists when needed (• item).
Use sentence-case labels only when a short heading helps — never hash prefixes.
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

  let out = text.replace(/\r\n/g, "\n");

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
