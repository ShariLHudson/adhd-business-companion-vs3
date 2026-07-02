"use client";

import { CHAT_THINKING_LABEL } from "./visibleThinking/chatThinkingUi";
import type { VisibleThinkingContext } from "./visibleThinking";

/**
 * While the companion waits on the model, show one calm label — no rotating copy.
 */
export function useVisibleThinking(
  isActive: boolean,
  context: VisibleThinkingContext | null,
): string | null {
  if (!isActive || !context) return null;
  return CHAT_THINKING_LABEL;
}
