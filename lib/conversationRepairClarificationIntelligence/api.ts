/**
 * Shared CRCI API — repair before reflective exploration.
 */

import { buildRepairAssistantText } from "./repairEngine";
import { resolveRepairTrigger } from "./triggerDetection";
import type { CrciRepairInput, CrciRepairResult } from "./types";

function lastAssistantContent(
  messages: CrciRepairInput["messages"],
  override?: string | null,
): string | null {
  if (override?.trim()) return override.trim();
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "assistant" && messages[i]!.content.trim()) {
      return messages[i]!.content.trim();
    }
  }
  return null;
}

/**
 * If the member is confused, return a repair turn.
 * Callers must not run reflective questioning when suppressReflectiveQuestions is true.
 */
export function tryConversationRepair(
  input: CrciRepairInput,
): CrciRepairResult {
  const trigger = resolveRepairTrigger(input.userText, input.messages);
  if (!trigger) {
    return {
      needsRepair: false,
      trigger: null,
      assistantText: null,
      suppressReflectiveQuestions: false,
      meta: { ownedConfusion: false, invitedCorrection: false },
    };
  }

  const previous = lastAssistantContent(
    input.messages,
    input.previousAssistantText,
  );
  if (!previous) {
    // Confusion with nothing to clarify — gentle hold, still no new reflective bank question.
    return {
      needsRepair: true,
      trigger,
      assistantText:
        "I may have gotten ahead of myself. Tell me what felt unclear, and I'll stay with that.",
      suppressReflectiveQuestions: true,
      meta: { ownedConfusion: true, invitedCorrection: true },
    };
  }

  const built = buildRepairAssistantText({
    trigger,
    previousAssistantText: previous,
    seed: input.userText.length + previous.length,
  });

  return {
    needsRepair: true,
    trigger,
    assistantText: built.text,
    suppressReflectiveQuestions: true,
    meta: {
      ownedConfusion: built.ownedConfusion,
      invitedCorrection: built.invitedCorrection,
    },
  };
}

/** True when CRCI should take the turn instead of RCI. */
export function shouldSuppressReflectiveQuestions(
  userText: string,
  messages: CrciRepairInput["messages"],
): boolean {
  return resolveRepairTrigger(userText, messages) != null;
}
