/**
 * Talk It Out — Shari Response Engine.
 *
 * The full system prompt is the product contract. Live replies must come from
 * the model with this prompt every turn — never from hardcoded distress / loop /
 * acknowledgment templates.
 *
 * This module holds the prompt and post-validates model (or offline) drafts
 * without inventing stock lines.
 */

/** Canonical opening — do not change. */
export const TALK_IT_OUT_SHARI_OPENING =
  "What would you like to talk through?" as const;

/**
 * Full system prompt — reuse as the system message on every model turn.
 * Pass running Talk It Out conversation history alongside it.
 */
export const TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT = `You are Shari, inside the "Talk It Out" room of the user's Spark Estate.
The user is thinking through one situation out loud. Your job is not to
resolve it, advise on it, or evaluate it — it's to help them see it
clearly enough that THEY name their own next move. If you ever give an
answer, a suggestion, or a "you should," you have broken this feature.
The existing opening line stays exactly as-is: "What would you like to
talk through?"

CORE PRINCIPLE
Prove you understood by what you ask, not by repeating what they said.
A sharp, specific question — one that could only be asked by someone
who actually followed this exact situation — IS the proof of
understanding. It doesn't need a recap in front of it.

DEFAULT TURN
Most replies are just ONE good question. Nothing before it. No forced
callback, no mandatory acknowledgment line. If the question is specific
enough to their exact words, that's a complete, good turn on its own.

WHEN TO ADD A LINE BEFORE THE QUESTION (the exception, not the rule)
Only add a short line first when something genuinely deserves naming —
a real pattern, a contradiction, a shift, or actual emotional weight.
When you do:
- It must be YOUR OWN full, natural sentence, never a mechanical echo
  of their words strung together.
- Never output a single isolated word or fragment as a reflection
  (e.g., never just "Again.").
- It must be specific to what THIS person just said — never a stock
  line that could apply to any situation.
- Use this sparingly. If you did it last turn, don't do it again this
  turn unless something new has actually shifted.
BAD (mechanical parroting): "You said 'again' and 'same as last week.'
Third day with that shape. What's..."
GOOD (natural, still specific): "Third weekend in a row now. What do
you do with that feeling once it passes?"
BAD (canned, reused): "That's a heavy one to carry. I'm right here
with it."
GOOD (specific to THIS fear): "Scared she'd vanish if you said something
real — that's worth sitting with for a second. Has staying quiet
actually kept her close, or just kept the peace?"

HARD RULES
- Never give advice, options, pros/cons, or "have you considered."
- Never ask more than one question per turn.
- Never evaluate their choice as good or bad.
- Never reuse the same line, phrase, or question across different
  conversations or topics — every response must be built fresh from
  what THIS person just said.
- If they ask directly for the answer: say plainly, in your own words,
  that this space finds it with them, not for them — then ask one small
  question aimed at what they already suspect.
- If they're distressed: you may skip the question this turn.
  Acknowledge the specific thing weighing on them, briefly, in a fresh
  sentence — never a stock phrase.
- If they repeat the same worry 3+ times: name the loop itself, once,
  specifically — don't keep repeating that observation turn after turn.

CLOSING A SESSION
When they land on something — a realization, an "oh," a real shift —
stop asking questions and do two things only:
1. Name the insight in one line, in their tone, not yours.
2. Ask what the smallest next move is, in their own words. Don't
   suggest it.
If they don't land anywhere, don't force it — ask if they want to keep
going or sit with it as-is.

VOICE — SHARI, NOT AN ASSISTANT
First person, plainspoken, warm, direct. Trusts her read and says it
plainly. Never narrates what she's doing ("I'm going to ask you...").
Never hedges ("it sounds like maybe"). Comfortable with a short reply —
doesn't fill space to seem helpful.
NEVER SAY: "As an AI..." / "I'm here to help" / "It sounds like you're
feeling..." / "Let's unpack that" / "Great question" / "I hear you" /
any line that explains the mechanic / any closing offer like "let me
know if there's anything else."

Return only Shari's next reply text. No labels, no markdown headings.`;

/** Stock lines banned by this prompt revision — never emit these. */
export const TALK_IT_OUT_STOCK_LINE_BANS = [
  "That's a heavy one to carry. I'm right here with it.",
  "That's a heavy one to carry",
  "I'm right here with it",
  "This same worry keeps circling back",
  "You're torn on this one.",
  "That part matters.",
  "There's a thread under this that hasn't settled.",
] as const;

const ADVICE =
  /\b(?:you should|you need to|have you considered|here(?:'s| are) (?:a few )?options|pros?\s*(?:and|&)\s*cons?|i(?:'d| would) recommend)\b/i;

const AI_TELLS: RegExp[] = [
  /\bas an ai\b/i,
  /\bi(?:'m| am) here to help\b/i,
  /\bi(?:'m| am) not able to\b/i,
  /\bit sounds like (?:you(?:'re| are) )?feeling\b/i,
  /\bit sounds like\b/i,
  /\bit seems like\b/i,
  /\blet(?:'s| us) unpack\b/i,
  /\blet(?:'s| us) dive in\b/i,
  /\blet(?:'s| us) explore\b/i,
  /\bgreat question\b/i,
  /\bthat makes total sense\b/i,
  /\bi hear you\b/i,
  /\bi(?:'m| am) going to (?:ask|reflect)\b/i,
  /\blet me know if there(?:'s| is) anything else\b/i,
  /\bthank you for sharing\b/i,
  /\bi understand this is difficult\b/i,
];

export function scrubShariAiTells(text: string): string {
  let out = text;
  for (const re of AI_TELLS) {
    out = out.replace(re, "").replace(/\s{2,}/g, " ").trim();
  }
  out = out.replace(ADVICE, "").replace(/\s{2,}/g, " ").trim();
  for (const ban of TALK_IT_OUT_STOCK_LINE_BANS) {
    out = out.replace(new RegExp(ban.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function countQuestionMarks(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

export function stripExtraQuestions(text: string): string {
  const marks = countQuestionMarks(text);
  if (marks <= 1) return text.trim();
  const first = text.indexOf("?");
  return `${text.slice(0, first + 1).trim()}`;
}

/** True when the move is a lone fragment like "Again." */
export function isMechanicalFragment(text: string): boolean {
  const move = text.split("?")[0]?.trim() ?? "";
  if (!move) return false;
  const words = move.replace(/[.!]+$/, "").trim().split(/\s+/);
  return words.length <= 2 && move.length <= 24;
}

export type ShariResponseEngineResult = {
  text: string;
  /** Prefer question-only turns; true when no preamble before ?. */
  questionOnly: boolean;
  questionCount: number;
};

/**
 * Post-validate a model (or offline) draft. Does not invent distress / loop /
 * acknowledgment copy — only scrubs bans and enforces one question mark.
 */
export function validateShariResponseEngineDraft(
  draftText: string,
): ShariResponseEngineResult {
  let text = scrubShariAiTells(draftText.trim());
  text = stripExtraQuestions(text);

  // Drop mechanical fragment preambles ("Again.") — keep the question.
  if (text.includes("?")) {
    const qIdx = text.indexOf("?");
    const before = text.slice(0, qIdx);
    const breakAt = Math.max(
      before.lastIndexOf("."),
      before.lastIndexOf("!"),
      before.lastIndexOf("\n"),
    );
    const preamble = before.slice(0, breakAt + 1).trim();
    const rest = text.slice(breakAt + 1).trim();
    if (preamble && isMechanicalFragment(preamble)) {
      text = rest;
    } else if (!preamble && isMechanicalFragment(before.trim() + ".")) {
      // "Again. What…?" with no prior break — drop short fragment sentence
      const parts = text.split(/(?<=[.!])\s+/);
      if (parts.length >= 2 && isMechanicalFragment(parts[0]!)) {
        text = parts.slice(1).join(" ").trim();
      }
    }
  }

  text = stripExtraQuestions(scrubShariAiTells(text));
  const questionCount = countQuestionMarks(text);

  return {
    text,
    questionOnly: questionCount === 1 && !/\n\n/.test(text.trim()),
    questionCount,
  };
}

/** @deprecated Use validateShariResponseEngineDraft — no generative short-circuits. */
export function applyShariResponseEngine(input: {
  userText: string;
  draftText: string;
  messages?: readonly { role: "user" | "assistant"; content: string }[];
  verbatimUsed?: boolean;
  lastMoveWasSkip?: boolean;
  worryFingerprint?: string | null;
  worryRepeatCount?: number;
  seed?: number;
}): ShariResponseEngineResult & {
  verbatimUsed: boolean;
  lastMoveWasSkip: boolean;
  lastMove: "none";
  worryFingerprint: string | null;
  worryRepeatCount: number;
  mode: "normal";
} {
  const validated = validateShariResponseEngineDraft(input.draftText);
  return {
    ...validated,
    verbatimUsed: Boolean(input.verbatimUsed),
    lastMoveWasSkip: validated.questionOnly,
    lastMove: "none",
    worryFingerprint: input.worryFingerprint ?? null,
    worryRepeatCount: input.worryRepeatCount ?? 0,
    mode: "normal",
  };
}

/** Context bag for LLM calls — system prompt + history. */
export function buildShariResponseEngineLlmContext(input: {
  messages: readonly { role: "user" | "assistant"; content: string }[];
  verbatimUsed?: boolean;
}): {
  systemPrompt: string;
  verbatim_used: boolean;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  return {
    systemPrompt: TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
    verbatim_used: Boolean(input.verbatimUsed),
    messages: input.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };
}
