import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import type {
  EmotionalFirstActionSecondDecision,
  MomentNeed,
  ResponseDepth,
} from "./types";
import { CANONICAL_EMOTIONAL_OPENINGS } from "./principles";

const EXPLICIT_TASK_RE =
  /\b(?:help me (?:create|write|draft|build|make|plan)|write (?:a|an|my)|create (?:a|an|my)|draft (?:a|an|my)|build (?:a|an|my)|make (?:a|an|my))\b/i;

const DIRECT_COMMAND_RE =
  /\b(?:take me|go to|bring me|show me|open (?:the )?|visit (?:the )?|head to)\b/i;

const CURIOUS_RE =
  /^\s*(?:what if|how might|could we|i wonder|curious about|thinking about)\b/i;

const HEAVY_WITHOUT_TASK_RE =
  /\b(?:can'?t get anything done|wasted another day|i just can'?t|nothing got done|failed again|so ashamed|feel like a failure)\b/i;

function inferMomentNeeds(
  signals: ReturnType<typeof detectMemberEmotionalSignals>,
  text: string,
): MomentNeed[] {
  const needs: MomentNeed[] = [];

  if (signals.includes("grief") || signals.includes("exhaustion")) {
    needs.push("rest", "being_understood");
  }
  if (signals.includes("shame") || signals.includes("discouragement")) {
    needs.push("reassurance", "being_understood");
  }
  if (signals.includes("overwhelm") || signals.includes("confusion")) {
    needs.push("clarity", "tiny_next_step");
  }
  if (signals.includes("fear") || signals.includes("stress")) {
    needs.push("reassurance", "permission");
  }
  if (signals.includes("pride") || signals.includes("excitement")) {
    needs.push("celebration", "reflection");
  }
  if (/\bhelp me focus\b/i.test(text)) {
    needs.push("clarity", "being_understood");
  }
  if (HEAVY_WITHOUT_TASK_RE.test(text)) {
    needs.push("being_understood", "rest");
  }
  if (needs.length === 0 && signals.length > 0) {
    needs.push("being_understood");
  }

  return [...new Set(needs)];
}

function resolveDepth(
  text: string,
  signals: ReturnType<typeof detectMemberEmotionalSignals>,
  overwhelmed?: boolean,
): ResponseDepth {
  if (DIRECT_COMMAND_RE.test(text)) return "direct_command";
  if (
    matchCanonicalEmotionalOpening(text) &&
    !EXPLICIT_TASK_RE.test(text)
  ) {
    return "emotional_first";
  }
  if (
    EXPLICIT_TASK_RE.test(text) &&
    signals.length === 0 &&
    !HEAVY_WITHOUT_TASK_RE.test(text) &&
    !overwhelmed
  ) {
    return "task_first";
  }
  if (CURIOUS_RE.test(text) && signals.length === 0) return "curious";
  if (
    signals.length > 0 ||
    overwhelmed ||
    HEAVY_WITHOUT_TASK_RE.test(text)
  ) {
    return "emotional_first";
  }
  return "balanced";
}

export function evaluateEmotionalFirstActionSecond(input: {
  userText: string;
  overwhelmed?: boolean;
}): EmotionalFirstActionSecondDecision {
  const text = input.userText.trim();
  const signals = detectMemberEmotionalSignals(text);
  const depth = resolveDepth(text, signals, input.overwhelmed);
  const momentNeeds = inferMomentNeeds(signals, text);

  return {
    depth,
    momentNeeds,
    emotionalSignalsPresent: signals.length > 0 || Boolean(input.overwhelmed),
    reason:
      depth === "task_first"
        ? "explicit task — action without therapizing"
        : depth === "emotional_first"
          ? `emotion present: ${signals.join(", ") || "heavy phrasing"}`
          : depth,
  };
}

export function matchCanonicalEmotionalOpening(
  text: string,
): { key: string; guidance: string; avoid: string } | null {
  for (const [key, entry] of Object.entries(CANONICAL_EMOTIONAL_OPENINGS)) {
    if (entry.pattern.test(text)) {
      return { key, guidance: entry.guidance, avoid: entry.avoid };
    }
  }
  return null;
}

export function buildCanonicalEmotionalLocalReply(text: string): string | null {
  const match = matchCanonicalEmotionalOpening(text);
  return match?.guidance ?? null;
}
