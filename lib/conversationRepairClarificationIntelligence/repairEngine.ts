/**
 * Repair sequence — acknowledge, plain-language restate, check fit, no new topic.
 */

import type { CrciRepairTrigger } from "./types";

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

/** Soften last assistant line into something explainable (drop stacked questions). */
export function extractThoughtToClarify(previousAssistant: string): string {
  let text = previousAssistant.trim();
  // Prefer first meaningful sentence before a question, or the question itself.
  const qIdx = text.indexOf("?");
  if (qIdx > 0) {
    const before = text.slice(0, qIdx).trim();
    const lastBreak = Math.max(
      before.lastIndexOf("."),
      before.lastIndexOf("!"),
    );
    if (lastBreak > 20) {
      text = before.slice(lastBreak + 1).trim();
      if (!text.endsWith("?")) text = `${text}?`;
    } else {
      text = text.slice(0, qIdx + 1).trim();
    }
  }
  // Strip formulaic openers for the paraphrase
  text = text
    .replace(/^can i ask you something\??\s*/i, "")
    .replace(/^i(?:'m| am) curious[^.?]*[.!]?\s*/i, "")
    .trim();
  return text || previousAssistant.trim();
}

function paraphraseThought(thought: string, seed: number): string {
  const core = thought.replace(/\?+$/, "").trim();
  const frames = [
    `What I meant was that I was wondering ${softenAsWonder(core)}.`,
    `Here's what I was trying to get at: ${softenAsPlain(core)}.`,
    `I was trying to ask whether ${softenAsWhether(core)}.`,
  ];
  return pick(frames, seed);
}

function softenAsWonder(core: string): string {
  const c = core.replace(/^(?:what|which|how|do|does|is|are)\s+/i, "");
  if (/^(?:whether|if)\b/i.test(c)) return c.charAt(0).toLowerCase() + c.slice(1);
  return `whether ${c.charAt(0).toLowerCase()}${c.slice(1)}`;
}

function softenAsPlain(core: string): string {
  return core.charAt(0).toLowerCase() + core.slice(1);
}

function softenAsWhether(core: string): string {
  return softenAsWonder(core).replace(/^whether\s+/i, "");
}

const ACKS = [
  "That's a fair question.",
  "I don't think I explained that very clearly.",
  "Happy to slow down.",
  "Let me try that again in plain words.",
] as const;

const CHECKS = [
  "I may be off, though. Does that better explain what I was trying to say?",
  "Tell me if I'm misunderstanding — does that fit better?",
  "Does that land, or were you thinking about something different?",
  "Does that clarify it, or should I try another way?",
] as const;

/**
 * Build one repair turn. Never introduces a new reflective topic.
 */
export function buildRepairAssistantText(input: {
  trigger: CrciRepairTrigger;
  previousAssistantText: string;
  seed: number;
}): { text: string; ownedConfusion: boolean; invitedCorrection: boolean } {
  const thought = extractThoughtToClarify(input.previousAssistantText);
  const owned =
    input.trigger === "confused" ||
    input.trigger === "doesnt-make-sense" ||
    input.trigger === "dont-understand" ||
    input.trigger === "explain" ||
    input.trigger === "what-do-you-mean";

  const ack = owned
    ? pick(
        [
          "I don't think I explained that very clearly.",
          "That's a fair question.",
          "Let me try that again in plain words.",
        ],
        input.seed,
      )
    : pick(ACKS, input.seed);

  const explanation = paraphraseThought(thought, input.seed + 3);
  const check = pick(CHECKS, input.seed + 7);

  // At most one question — the check for understanding.
  const text = `${ack} ${explanation} ${check}`.replace(/\s+/g, " ").trim();

  return {
    text,
    ownedConfusion: owned,
    invitedCorrection: true,
  };
}
