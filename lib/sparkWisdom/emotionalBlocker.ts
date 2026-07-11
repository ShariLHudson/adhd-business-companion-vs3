/**
 * Spec 132 — Emotional Blocker Conversations
 * Understand why they can't begin before suggesting how to do the task.
 *
 * @see docs/conversation-tests/ct-05.md
 */

import type { EmotionalBlockerCue } from "./types";

export type EmotionalBlockerDepth = "explore" | "honor_practical" | "off";

/** Member is stuck starting — the question is why, not how. */
const EMOTIONAL_BLOCKER_RE =
  /\b(procrastinat(?:ing|ed|e)?|can't get(?: myself)? started|cannot get(?: myself)? started|can't make myself|cannot make myself|know what (?:i )?need to do but (?:i'?m )?avoid|(?:just )?avoiding (?:it|this|that|my)|putting (?:it|this|that|.+) off|haven't (?:been able to )?start|keep putting off|won't make myself|why can't i (?:start|begin|do it)|why do i keep avoiding|just can't (?:do|make myself))\b/i;

/** Member asked for the tool — honor it; don't therapize. */
const EXPLICIT_PRACTICAL_REQUEST_RE =
  /\b((?:start|set|run|open)\s+(?:a\s+)?(?:timer|focus session|pomodoro)|print (?:this|it|that)|export (?:this|to pdf)|just (?:want|needed) (?:a )?timer|help me print)\b/i;

/** Venting — listen; don't excavate. */
const VENT_ONLY_RE =
  /\b(just venting|don't need advice|not looking for (?:advice|solutions)|needed to (?:say|get) (?:this )?out|just wanted to share)\b/i;

export const EMOTIONAL_BLOCKER_POSSIBLE_BLOCKERS = [
  "overwhelm",
  "fear of making a mistake",
  "perfectionism",
  "shame",
  "embarrassment",
  "uncertainty",
  "boredom",
  "decision fatigue",
  "feeling behind",
  "fear of success",
  "fear of failure",
] as const;

export const EMOTIONAL_BLOCKER_FORBIDDEN_UNTIL_UNDERSTOOD = [
  "Do NOT suggest focus sessions, timers, pomodoros, or productivity tips.",
  "Do NOT offer checklists, step lists, or planning tools.",
  "Do NOT invite Estate workspaces or tool switches.",
  "Do NOT assume the task is the problem — wonder what emotion may be attached.",
  "Use gentle curiosity first — not problem solving.",
  "Never present possible blockers as a checklist to the member.",
  "Exactly ONE gentle curiosity question or short reflection on turn 1 — not advice.",
] as const;

const ADHD_NORMALIZE_LINE =
  "One thing I've noticed about ADHD is that our brains sometimes treat uncomfortable tasks as if they're dangerous. That doesn't mean you're lazy or unmotivated—it means your brain is trying to protect you from discomfort.";

export function assessEmotionalBlockerDepth(message: string): EmotionalBlockerDepth {
  const trimmed = message.trim();
  if (!trimmed || VENT_ONLY_RE.test(trimmed)) return "off";
  if (!EMOTIONAL_BLOCKER_RE.test(trimmed)) return "off";
  if (EXPLICIT_PRACTICAL_REQUEST_RE.test(trimmed)) return "honor_practical";
  return "explore";
}

export function recommendEmotionalBlocker(message: string): EmotionalBlockerCue | null {
  const depth = assessEmotionalBlockerDepth(message);
  if (depth === "off") return null;

  const base: EmotionalBlockerCue = {
    depth,
    signal: "Activation friction — member needs to understand why they can't begin",
    curiosityOpener:
      "Can I tell you what I'm wondering? People rarely procrastinate because they don't know how to do something. Usually there's something underneath it.",
    possibleBlockers: EMOTIONAL_BLOCKER_POSSIBLE_BLOCKERS,
    adhdNormalizeLine: ADHD_NORMALIZE_LINE,
    adhdNormalizeWhenFit:
      "Use ADHD normalization only once, only when it genuinely fits — never as a default lecture.",
    guidance: "",
  };

  if (depth === "honor_practical") {
    return {
      ...base,
      guidance:
        "Brief warmth first — then honor the practical request (timer, print, etc.). Do not dig deeply when they already named what they want.",
    };
  }

  return {
    ...base,
    guidance:
      "Understand → explore → reduce emotional burden → only then decide together if action fits. Member should feel lighter before productive.",
  };
}

export function summarizeEmotionalBlocker(cue: EmotionalBlockerCue): string {
  return `Emotional blocker (${cue.depth}): ${cue.signal}`;
}
