/**
 * Spark Human Voice Rules — permanent language standards.
 * Authentic Shari voice; not AI-detector evasion.
 *
 * @see docs/SPARK_HUMAN_VOICE_RULES.md
 */

export const SPARK_HUMAN_VOICE_PRINCIPLE =
  "Spark must never sound like generic AI. Sound like Shari talking naturally — warm, plainspoken, one thought at a time." as const;

export const SPARK_HUMAN_VOICE_FINAL_CHECK = `FINAL VOICE CHECK (before every response):
1. Would a real person say this out loud?
2. Would Shari say this?
3. Does this sound like AI?
If it sounds like AI — rewrite before sending.
Goal: authentic human voice. Not deception. Not tricking detectors. Truthful, helpful, clear.` as const;

/** Banned unless member explicitly asked for structure/steps/outline. */
export const SPARK_AI_VOICE_FORBIDDEN_PHRASES: readonly RegExp[] = [
  /\bin conclusion\b/i,
  /\bit is important to note\b/i,
  /\bit'?s important to note\b/i,
  /\bhere'?s a breakdown\b/i,
  /\blet'?s dive in\b/i,
  /\bgreat question[!]?\b/i,
  /\bthat reminds me of something\b/i,
  /\bsomething about the way you said that makes me curious\b/i,
  /\bas an ai\b/i,
  /\bas a language model\b/i,
  /\bi hope this helps\b/i,
  /\blet'?s break (?:this |it )?down\b/i,
  /\bthat sounds tough\b/i,
  /\bwould you like assistance\b/i,
  /\bhere'?s a simple outline\b/i,
  /\bhow does that sound\??\b/i,
  /\bwhat specifically feels challenging\b/i,
  /\blet'?s focus on key points\b/i,
  /\bshall i help you\b/i,
  /\bfeel free to\b/i,
  /\bdon'?t hesitate to\b/i,
  /\bhelp me understand something\b/i,
  /\bthis might help me suggest\b/i,
  /\bone effective way is\b/i,
];

export const SPARK_AI_VOICE_FORBIDDEN_LABELS = [
  "In conclusion",
  "It's important to note",
  "Here's a breakdown",
  "Let's dive in",
  "Great question!",
  "Let's break it down",
  "That sounds tough",
  "Would you like assistance",
  "Here's a simple outline",
  "How does that sound?",
  "Shall I help you",
  "That reminds me of something",
  "Something about the way you said that makes me curious",
  "As an AI",
  "I hope this helps",
  "Robotic markdown headings (###, ##)",
  "Excessive bolding",
  "Long numbered frameworks (unless requested)",
] as const;

const STRUCTURED_OUTPUT_REQUEST_RE =
  /\b(outline|step[- ]by[- ]step|numbered steps?|breakdown|checklist|framework|structured document|bullet points?|list format|format as|write (?:it )?as a list)\b/i;

/** Member explicitly wants structure — allow headings/lists. */
export function memberRequestedStructuredOutput(userText?: string): boolean {
  if (!userText?.trim()) return false;
  return STRUCTURED_OUTPUT_REQUEST_RE.test(userText);
}

export type AiVoiceIssue = {
  kind: "phrase" | "markdown_heading" | "excessive_bold" | "numbered_framework";
  detail: string;
};

export function detectAiVoiceIssues(
  response: string,
  userText?: string,
): AiVoiceIssue[] {
  const issues: AiVoiceIssue[] = [];
  const allowStructure = memberRequestedStructuredOutput(userText);

  for (const pattern of SPARK_AI_VOICE_FORBIDDEN_PHRASES) {
    if (pattern.test(response)) {
      issues.push({ kind: "phrase", detail: pattern.source });
    }
  }

  if (!allowStructure) {
    if (/^#{1,6}\s/m.test(response)) {
      issues.push({ kind: "markdown_heading", detail: "markdown heading" });
    }
    if (/^\*{3,}\s*$/m.test(response) || /^---+\s*$/m.test(response)) {
      issues.push({ kind: "markdown_heading", detail: "markdown divider" });
    }
    const numberedItems = response.match(/^\s*\d+[.)]\s+/gm);
    if ((numberedItems?.length ?? 0) >= 4) {
      issues.push({
        kind: "numbered_framework",
        detail: `${numberedItems!.length} numbered items`,
      });
    }
  }

  const boldCount = (response.match(/\*\*[^*]+\*\*/g) ?? []).length;
  if (boldCount >= 3) {
    issues.push({
      kind: "excessive_bold",
      detail: `${boldCount} bold spans`,
    });
  }

  return issues;
}

export function containsAiVoiceIssue(
  response: string,
  userText?: string,
): boolean {
  return detectAiVoiceIssues(response, userText).length > 0;
}

export function scrubAiVoiceFormatting(
  text: string,
  userText?: string,
): { text: string; rewritten: boolean } {
  if (memberRequestedStructuredOutput(userText)) {
    return { text, rewritten: false };
  }

  let rewritten = false;
  let out = text;

  const withoutHeadings = out.replace(/^#{1,6}\s+/gm, "");
  if (withoutHeadings !== out) {
    rewritten = true;
    out = withoutHeadings;
  }

  const withoutBold = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  if (withoutBold !== out) {
    rewritten = true;
    out = withoutBold;
  }

  const withoutHr = out.replace(/^[*-]{3,}\s*$/gm, "");
  if (withoutHr !== out) {
    rewritten = true;
    out = withoutHr;
  }

  return { text: out.trim(), rewritten };
}

const PHRASE_REPLACEMENTS: readonly [RegExp, string][] = [
  [/\bin conclusion[,]?\s*/gi, ""],
  [/\bit is important to note that\s*/gi, ""],
  [/\bit'?s important to note that\s*/gi, ""],
  [/\bhere'?s a breakdown[.:]?\s*/gi, ""],
  [/\blet'?s dive in[.:]?\s*/gi, ""],
  [/\bgreat question[!]?[.]?\s*/gi, ""],
  [
    /\bthat reminds me of something[.:]?\s*/gi,
    "",
  ],
  [
    /\bsomething about the way you said that makes me curious[.:]?\s*/gi,
    "",
  ],
  [/\bi hope this helps[.!]?\s*/gi, ""],
  [/\bfeel free to ask\b/gi, "ask anytime"],
  [/\bdon'?t hesitate to\b/gi, "you can"],
  [/\bhelp me understand something[.:]?\s*/gi, ""],
  [/\bone effective way is\s*/gi, ""],
  [/\bthis might help me suggest a better approach[.!]?\s*/gi, ""],
];

export function scrubAiVoicePhrases(text: string): {
  text: string;
  rewritten: boolean;
} {
  let rewritten = false;
  let out = text;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    if (pattern.test(out)) {
      rewritten = true;
      out = out.replace(pattern, replacement);
    }
  }
  return { text: out.replace(/\n{3,}/g, "\n\n").trim(), rewritten };
}

export const SPARK_HUMAN_VOICE_PROMPT_BLOCK = `# SPARK HUMAN VOICE (permanent — overrides generic AI writing)

${SPARK_HUMAN_VOICE_PRINCIPLE}

BANNED FORMATTING (unless member explicitly asks for outline, steps, checklist, or structured document):
- No markdown heading symbols: ###, ##, #, horizontal rules
- No robotic outline formatting
- No excessive bolding (**text**)
- No long numbered frameworks (4+ numbered steps) unless they asked for steps

BANNED PHRASES (rewrite — never default to these):
${SPARK_AI_VOICE_FORBIDDEN_LABELS.map((l) => `- ${l}`).join("\n")}

VOICE GOAL:
- Warm · plainspoken · conversational
- Slightly imperfect in a human way — real people don't write essays in chat
- Shorter responses · one thought at a time
- No essay format unless requested
- No corporate tone
- No therapy-speak unless the moment truly calls for care

NOT every conversation is therapeutic. Sometimes they want a timer, to print something, or to vent. Judgment beats excavation.

${SPARK_HUMAN_VOICE_FINAL_CHECK}` as const;

export const SPARK_HUMAN_VOICE_SCORECARD_QUESTION =
  "Did this response sound like Shari, or did it sound like AI-generated text?" as const;
