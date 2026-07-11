/**
 * Spec 128 — Thinking Pause
 */

import {
  detectHiddenIntent,
  type HiddenIntentHypothesis,
} from "@/lib/sparkConversation/hiddenIntent";
import { assessMemberNeed } from "./memberNeed";
import { recognizeWorkspaceOpportunity } from "./opportunityRecognition";
import type { ThinkingPauseSnapshot } from "./types";

const COGNITIVE_OVERLOAD_RE =
  /\b((\d+|fifteen|several|many)\s+(things|tasks|options|projects).*(important|priority|urgent)|every one of them feels important|too many (things|tasks|priorities))\b/i;

const EMOTION_PATTERNS: readonly { pattern: RegExp; label: string }[] = [
  { pattern: COGNITIVE_OVERLOAD_RE, label: "Cognitive overload" },
  { pattern: /\b(overwhelm|too much)\b/i, label: "Overwhelm" },
  { pattern: /\b(scared|afraid|anxious|nervous)\b/i, label: "Fear or anxiety" },
  { pattern: /\b(frustrat|annoyed|angry)\b/i, label: "Frustration" },
  { pattern: /\b(doubt|uncertain|unsure)\b/i, label: "Doubt" },
  { pattern: /\b(excited|energized|pumped)\b/i, label: "Positive momentum" },
  { pattern: /\b(tired|exhausted|burned out)\b/i, label: "Depletion" },
];

function detectEmotionUnderneath(message: string): string | null {
  for (const entry of EMOTION_PATTERNS) {
    if (entry.pattern.test(message)) return entry.label;
  }
  return null;
}

export function runThinkingPause(input: {
  memberMessage: string;
  hiddenIntent: HiddenIntentHypothesis | null;
}): ThinkingPauseSnapshot {
  const memberNeed = assessMemberNeed(input.memberMessage);
  const opportunity = recognizeWorkspaceOpportunity(input.memberMessage);
  const invisibleWorkNotes: string[] = [
    "Prepare context retrieval if relevant",
    "Withhold drafts/exports until permission",
  ];

  if (input.hiddenIntent) {
    invisibleWorkNotes.push(
      `Hidden intent: coach toward ${input.hiddenIntent.hiddenGoal}`,
    );
  }

  const cognitiveOverload = COGNITIVE_OVERLOAD_RE.test(input.memberMessage);

  return {
    surfaceAsk: input.memberMessage.trim(),
    accomplishmentGoal: input.hiddenIntent?.hiddenGoal ?? null,
    emotionUnderneath: detectEmotionUnderneath(input.memberMessage),
    cognitiveOverload,
    helpMost: memberNeed.primary,
    workspaceCandidate: opportunity?.label ?? null,
    invisibleWorkNotes,
  };
}

export function detectHiddenIntentForLoop(message: string) {
  return detectHiddenIntent(message);
}
