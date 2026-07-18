/**
 * Talk It Out — Shari Response Engine.
 *
 * Full system prompt is the product contract. Runtime is still deterministic:
 * this module shapes every reflective turn to that contract, and the same
 * prompt string is ready to pass as the system message if/when LLM drafting
 * is enabled for Talk It Out.
 */

import { significantTokens } from "./voice";

/** Canonical opening — do not change. */
export const TALK_IT_OUT_SHARI_OPENING =
  "What would you like to talk through?" as const;

/**
 * Full system prompt — reuse as the system message on every LLM turn.
 * Pass running Talk It Out history + `verbatim_used` alongside it.
 */
export const TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT = `You are Shari, inside the "Talk It Out" room of the user's Spark Estate.
The user is thinking through one situation out loud. Your job is not to
resolve it, advise on it, or evaluate it — it's to help them see it
clearly enough that THEY name their own next move. If you ever give an
answer, a suggestion, or a "you should," you have broken this feature.
The existing opening line for this feature stays exactly as-is:
"What would you like to talk through?"

TURN STRUCTURE (every reply, no exceptions)
Two parts only:
1. ONE short move proving you tracked what they said — rotate between:
   - micro-quote: echo just the 1-3 word phrase carrying the weight
   - reframe: state the pattern in new, sharper words (not their words)
   - callback: reference something earlier in this session, unquoted
   - skip: go straight to the question (only if their last message was
     already short/clear — never skip two turns in a row)
   Do NOT repeat their full sentence back verbatim more than once per
   session. That's the one move to use rarely, only when a line truly
   deserves to sit there unedited.
2. Exactly ONE open question, built from specifics they just gave you
   (a number, a word, a timeframe) — never generic, never more than one
   question mark per reply.

HARD RULES
- Never give advice, options, pros/cons, or "have you considered."
- Never ask more than one question per turn.
- Never evaluate their choice as good or bad.
- If they ask directly for the answer: say plainly this space finds it
  with them, not for them, then ask one small question aimed at what
  they already suspect.
- If they're distressed: drop the question this turn. Acknowledge the
  weight of it in one line, nothing else.
- If they repeat the same worry 3+ times: name the loop itself as the
  reflection before your question.

CLOSING A SESSION
When they land on something — a realization, an "oh," a shift in what
they're saying — stop asking exploratory questions and do two things only:
1. Name the insight in one line, in their tone, not yours.
2. Ask what the smallest next move is, in their own words. Do not
   suggest it.
If they don't land anywhere, don't force it — ask if they want to keep
going or sit with it as-is.

VOICE — THIS IS SHARI, NOT AN ASSISTANT
Shari talks like the host of this estate, not a program answering a
prompt. First person, plainspoken, warm, never hedging, never explaining
what she's doing. She trusts her read and says it plainly — short
sentence, done.

NEVER SAY (banned outright — these are AI/chatbot tells):
- "As an AI..." / "I'm here to help" / "I'm not able to..."
- "It sounds like you're feeling..." / "It seems like..."
- "Let's unpack that" / "let's dive in" / "let's explore"
- "Great question" / "That makes total sense" / "I hear you"
- Anything that narrates the mechanic ("I'm going to reflect back...")
- Any closing offer like "Let me know if there's anything else"

SAY IT LIKE SHARI ACTUALLY TALKS:
- Not "It sounds like you're feeling torn about this"
  → "You're torn on this one."
- Not "That's a great insight, thank you for sharing"
  → "There it is."
- Not "I'd love to explore what's underneath that"
  → "What's underneath that?"
- Not "I understand this is difficult for you"
  → "That's a heavy one to carry around all week."
- Not "You said 'again' and 'same as last week.' Third day with that
  shape" → "Again. Same as last week. Third day running with that one."
- Not "That's the trade, and you just named it"
  → "There's the trade. You named it, not me."

RHYTHM
Short sentence first. A longer one only when the moment earns it. Silence
is fine — a one-line reflection plus a five-word question is a complete,
good turn. Never fill space to seem helpful.`;

export type ShariResponseMove =
  | "micro_quote"
  | "reframe"
  | "callback"
  | "skip"
  | "verbatim_rare";

export type ShariResponseEngineMode =
  | "normal"
  | "distressed"
  | "closing"
  | "answer_redirect"
  | "loop_named"
  | "sit_with_it";

export type ShariResponseEngineInput = {
  userText: string;
  draftText: string;
  messages: readonly { role: "user" | "assistant"; content: string }[];
  verbatimUsed: boolean;
  lastMoveWasSkip: boolean;
  worryFingerprint?: string | null;
  worryRepeatCount?: number;
  seed: number;
};

export type ShariResponseEngineResult = {
  text: string;
  verbatimUsed: boolean;
  lastMoveWasSkip: boolean;
  lastMove: ShariResponseMove | "none";
  worryFingerprint: string | null;
  worryRepeatCount: number;
  mode: ShariResponseEngineMode;
};

const DISTRESS =
  /\b(?:can'?t (?:stop )?crying|panic(?:king|ked)?|terrified|falling apart|breaking down|too much to bear|i(?:'m| am) (?:really )?scared|want to disappear|suicid|self[-\s]?harm)\b/i;

const ASKS_ANSWER =
  /\b(?:what should i (?:do|say|choose)|just tell me|give me (?:the |an )?answer|what would you do|tell me what to do|have you considered)\b/i;

const LANDING =
  /\b(?:^oh[.!]?\s|oh[,.]?\s+(?:that|wait|right)|that(?:'s| is) (?:it|the thing|exactly it)|i (?:just )?(?:realized|see(?: it)? now)|there it is|now i (?:get|see) it)\b/i;

const ADVICE =
  /\b(?:you should|you need to|have you considered|here(?:'s| are) (?:a few )?options|pros?\s*(?:and|&)\s*cons?|i(?:'d| would) recommend)\b/i;

const AI_TELLS: RegExp[] = [
  /\bas an ai\b/i,
  /\bi(?:'m| am) here to help\b/i,
  /\bi(?:'m| am) not able to\b/i,
  /\bit sounds like (?:you(?:'re| are) )?feeling\b/i,
  /\bit seems like\b/i,
  /\blet(?:'s| us) unpack\b/i,
  /\blet(?:'s| us) dive in\b/i,
  /\blet(?:'s| us) explore\b/i,
  /\bgreat question\b/i,
  /\bthat makes total sense\b/i,
  /\bi hear you\b/i,
  /\bi(?:'m| am) going to reflect\b/i,
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
  return out;
}

export function countQuestionMarks(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

export function splitMoveAndQuestion(text: string): {
  move: string;
  question: string | null;
} {
  const trimmed = text.trim();
  if (!trimmed.includes("?")) return { move: trimmed, question: null };
  const sentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [trimmed];
  const qSentence =
    [...sentences].reverse().find((s) => s.includes("?"))?.trim() ?? null;
  const moveParts = sentences
    .filter((s) => s.trim() !== qSentence)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    move: moveParts.join(" ").trim(),
    question: qSentence,
  };
}

function worryKey(userText: string): string {
  return significantTokens(userText).slice(0, 8).sort().join("|");
}

function pickMicroQuote(userText: string): string | null {
  const words = userText
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return null;
  // Prefer weighty short phrases: again / same as last week / third day
  const lower = userText.toLowerCase();
  const patterns = [
    /\bagain\b/i,
    /\bsame as last week\b/i,
    /\bthird day\b/i,
    /\btoo (?:much|many|hard)\b/i,
    /\bstuck\b/i,
    /\btorn\b/i,
    /\bheavy\b/i,
  ];
  for (const re of patterns) {
    const m = userText.match(re);
    if (m?.[0]) return m[0];
  }
  // 1–3 content words from the end (often the load)
  const content = words.filter((w) => w.length > 3 || /^(day|week|job|hire)$/i.test(w));
  if (content.length === 0) return words.slice(-2).join(" ");
  return content.slice(-Math.min(3, content.length)).join(" ");
}

function pickCallback(
  messages: readonly { role: "user" | "assistant"; content: string }[],
  userText: string,
): string | null {
  const priorUsers = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter((t) => t && t !== userText.trim());
  if (priorUsers.length === 0) return null;
  const earlier = priorUsers[priorUsers.length - 1]!;
  const tokens = significantTokens(earlier).slice(0, 4);
  if (tokens.length === 0) return "That thread from earlier is still here.";
  const label = tokens.slice(0, 2).join(" ");
  return `That ${label} piece from earlier is still in this.`;
}

function selectMove(input: {
  userText: string;
  verbatimUsed: boolean;
  lastMoveWasSkip: boolean;
  seed: number;
}): ShariResponseMove {
  const shortClear =
    input.userText.trim().split(/\s+/).length <= 12 &&
    !/[!]{2,}|\b(?:overwhelm|panic|terrified)\b/i.test(input.userText);

  if (shortClear && !input.lastMoveWasSkip) {
    return "skip";
  }

  // Rare full verbatim — once per session, only for a line that earns it
  if (
    !input.verbatimUsed &&
    input.userText.trim().length >= 48 &&
    input.userText.trim().length <= 140 &&
    input.seed % 11 === 0
  ) {
    return "verbatim_rare";
  }

  const options: ShariResponseMove[] = ["micro_quote", "reframe", "callback"];
  return options[Math.abs(input.seed) % options.length]!;
}

function ensureOneQuestion(question: string | null, userText: string): string {
  if (question && countQuestionMarks(question) === 1) {
    return question.replace(/\?+$/, "?");
  }
  const tokens = significantTokens(userText);
  const hook = tokens[0] ?? "this";
  return `What about ${hook} feels most unfinished?`;
}

function stripExtraQuestions(text: string): string {
  const marks = countQuestionMarks(text);
  if (marks <= 1) return text.trim();
  const first = text.indexOf("?");
  return `${text.slice(0, first + 1).trim()}`;
}

/**
 * Shape a draft into the Shari Response Engine turn contract.
 * Does not replace correction/help/completion early exits — those stay local.
 */
export function applyShariResponseEngine(
  input: ShariResponseEngineInput,
): ShariResponseEngineResult {
  const userText = input.userText.trim();
  const fingerprint = worryKey(userText);
  let worryRepeatCount = input.worryRepeatCount ?? 0;
  let worryFingerprint = input.worryFingerprint ?? null;
  if (fingerprint) {
    if (fingerprint === worryFingerprint) {
      worryRepeatCount += 1;
    } else {
      worryFingerprint = fingerprint;
      worryRepeatCount = 1;
    }
  }

  // Distressed — one line, no question
  if (DISTRESS.test(userText)) {
    return {
      text: scrubShariAiTells(
        "That's a heavy one to carry. I'm right here with it.",
      ),
      verbatimUsed: input.verbatimUsed,
      lastMoveWasSkip: false,
      lastMove: "none",
      worryFingerprint,
      worryRepeatCount,
      mode: "distressed",
    };
  }

  // Direct ask for the answer
  if (ASKS_ANSWER.test(userText)) {
    return {
      text: scrubShariAiTells(
        "This space finds it with you, not for you. What do you already suspect?",
      ),
      verbatimUsed: input.verbatimUsed,
      lastMoveWasSkip: false,
      lastMove: "none",
      worryFingerprint,
      worryRepeatCount,
      mode: "answer_redirect",
    };
  }

  // Landing / insight — name it + smallest next move
  if (LANDING.test(userText)) {
    const insight =
      pickMicroQuote(userText)?.replace(/^./, (c) => c.toUpperCase()) ??
      "There it is.";
    return {
      text: scrubShariAiTells(
        `${insight.endsWith(".") ? insight : `${insight}.`}\n\nWhat's the smallest next move, in your words?`,
      ),
      verbatimUsed: input.verbatimUsed,
      lastMoveWasSkip: false,
      lastMove: "micro_quote",
      worryFingerprint,
      worryRepeatCount,
      mode: "closing",
    };
  }

  const split = splitMoveAndQuestion(scrubShariAiTells(input.draftText));
  const question = ensureOneQuestion(split.question, userText);

  // Worry loop 3+
  if (worryRepeatCount >= 3) {
    const text = stripExtraQuestions(
      scrubShariAiTells(
        `This same worry keeps circling back.\n\n${question}`,
      ),
    );
    return {
      text,
      verbatimUsed: input.verbatimUsed,
      lastMoveWasSkip: false,
      lastMove: "reframe",
      worryFingerprint,
      worryRepeatCount,
      mode: "loop_named",
    };
  }

  const moveKind = selectMove({
    userText,
    verbatimUsed: input.verbatimUsed,
    lastMoveWasSkip: input.lastMoveWasSkip,
    seed: input.seed,
  });

  let move = "";
  let verbatimUsed = input.verbatimUsed;

  switch (moveKind) {
    case "skip":
      move = "";
      break;
    case "micro_quote": {
      const q = pickMicroQuote(userText);
      move = q ? `${q.charAt(0).toUpperCase()}${q.slice(1)}.` : "That part matters.";
      break;
    }
    case "reframe": {
      const clean = scrubShariAiTells(split.move)
        .replace(/\b(?:i wonder if|it may be|there might be|something here seems)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (clean && clean.length <= 120 && !isFullVerbatimOf(userText, clean)) {
        move = clean.endsWith(".") ? clean : `${clean}.`;
      } else {
        move = "You're torn on this one.";
      }
      break;
    }
    case "callback": {
      move =
        pickCallback(input.messages, userText) ??
        "There's a thread under this that hasn't settled.";
      break;
    }
    case "verbatim_rare": {
      const line = userText.replace(/\s+/g, " ").trim();
      move = line.endsWith(".") || line.endsWith("?") || line.endsWith("!")
        ? line
        : `${line}.`;
      verbatimUsed = true;
      break;
    }
  }

  const body = move
    ? `${move}\n\n${question}`
    : question;
  const text = stripExtraQuestions(scrubShariAiTells(body));

  return {
    text,
    verbatimUsed,
    lastMoveWasSkip: moveKind === "skip",
    lastMove: moveKind,
    worryFingerprint,
    worryRepeatCount,
    mode: "normal",
  };
}

function isFullVerbatimOf(userText: string, assistantMove: string): boolean {
  const a = userText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const b = assistantMove.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  return a.length > 20 && (a === b || b.includes(a));
}

/** Context bag for future LLM calls — system prompt + session flags. */
export function buildShariResponseEngineLlmContext(input: {
  messages: readonly { role: "user" | "assistant"; content: string }[];
  verbatimUsed: boolean;
}): {
  systemPrompt: string;
  verbatim_used: boolean;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  return {
    systemPrompt: TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
    verbatim_used: input.verbatimUsed,
    messages: input.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };
}
