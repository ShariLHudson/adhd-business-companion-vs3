"use client";

import { useEffect, useState } from "react";
import { CHAT_THINKING_LABEL } from "./visibleThinking/chatThinkingUi";
import { VISIBLE_THINKING_REVEAL_MS } from "./visibleThinking/messages";
import type { VisibleThinkingContext } from "./visibleThinking";

/**
 * While the companion waits on the model, show one calm label — no rotating copy.
 * Reveals only after VISIBLE_THINKING_REVEAL_MS so fast turns never flash thinking UI.
 */
export function useVisibleThinking(
  isActive: boolean,
  context: VisibleThinkingContext | null,
): string | null {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!isActive || !context) {
      setRevealed(false);
      return;
    }
    setRevealed(false);
    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, VISIBLE_THINKING_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [isActive, context]);

  if (!isActive || !context || !revealed) return null;
  return CHAT_THINKING_LABEL;
}
