/**
 * Per-depth question rules — what Spark may and may not ask.
 */

import type { ConversationDepth, ConversationPurpose } from "./types";

export const TASK_FORBIDDEN_QUESTIONS = [
  "What motivates you?",
  "How are you feeling today?",
  "What brings you joy?",
  "I've noticed a pattern about you",
  "Tell me about your childhood",
  "What's really going on emotionally?",
] as const;

export function appropriateQuestionsFor(
  purpose: ConversationPurpose,
  depth: ConversationDepth,
): string[] {
  if (depth === "task") {
    switch (purpose) {
      case "create":
        return [
          "Who is the audience?",
          "What is the goal?",
          "What action should readers take?",
          "Do you have content already?",
        ];
      case "research":
        return [
          "What are you trying to decide?",
          "What timeframe matters?",
          "Any sources you already trust?",
        ];
      case "learn":
        return [
          "Quick answer, example, apply to your business, or deep dive?",
          "What part feels unclear?",
        ];
      case "plan":
        return [
          "What timeframe are we planning?",
          "What's the one outcome that matters most?",
        ];
      case "organize":
        return [
          "What are we organizing?",
          "What would 'done' look like?",
        ];
      default:
        return [
          "What's the one thing we need to nail first?",
          "What do you have so far?",
        ];
    }
  }

  if (depth === "guidance") {
    return [
      "What's making this feel stuck?",
      "What would 'unstuck' look like?",
      "Want a different approach or more clarity first?",
    ];
  }

  if (depth === "reflection") {
    return [
      "What's feeling heaviest right now?",
      "What would help most — space, clarity, or one small step?",
    ];
  }

  return [
    "What would you like to explore?",
    "Where should we wander first?",
  ];
}

export function maxQuestionsForDepth(depth: ConversationDepth): number {
  switch (depth) {
    case "task":
      return 1;
    case "guidance":
      return 1;
    case "reflection":
      return 1;
    case "exploration":
      return 1;
  }
}

export function depthLabel(depth: ConversationDepth): string {
  switch (depth) {
    case "task":
      return "Level 1 — Task Mode";
    case "guidance":
      return "Level 2 — Guidance Mode";
    case "reflection":
      return "Level 3 — Reflection Mode";
    case "exploration":
      return "Level 4 — Exploration Mode";
  }
}

export function purposeLabel(purpose: ConversationPurpose): string {
  return purpose.charAt(0).toUpperCase() + purpose.slice(1);
}
