/**
 * The Eight Conversation Modes — Shari Pyramid (internal only).
 */

import type { ShariPrimaryHelpMode } from "./types";

/** Canonical eight modes from Shari Core Conversation Intelligence. */
export type ShariConversationMode =
  | "teach"
  | "explain"
  | "advise"
  | "compare"
  | "brainstorm"
  | "reflect"
  | "create"
  | "execute";

const HELP_MODE_TO_CONVERSATION_MODE: Record<
  ShariPrimaryHelpMode,
  ShariConversationMode | null
> = {
  how_to_guidance: "teach",
  explanation: "explain",
  direct_answer: "explain",
  advice: "advise",
  comparison: "compare",
  brainstorming: "brainstorm",
  reflective_thinking: "reflect",
  troubleshooting: "teach",
  simple_planning: "teach",
  simple_creation: "create",
  formal_creation: "create",
  project_execution: "execute",
  research: "teach",
  visual_exploration: "explain",
  strategic_work: "teach",
  explicit_navigation: null,
};

export function conversationModeFromHelpMode(
  mode: ShariPrimaryHelpMode,
): ShariConversationMode | null {
  return HELP_MODE_TO_CONVERSATION_MODE[mode] ?? null;
}

/** Modes that must answer in chat before any platform capability. */
export function isConversationalPyramidMode(
  mode: ShariConversationMode | null,
): boolean {
  return (
    mode === "teach" ||
    mode === "explain" ||
    mode === "advise" ||
    mode === "compare" ||
    mode === "brainstorm" ||
    mode === "reflect"
  );
}
