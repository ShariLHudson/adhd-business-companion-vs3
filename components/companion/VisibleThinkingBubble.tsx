"use client";

import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { useCompanionPresence } from "@/lib/useCompanionPresence";

type Props = {
  message: string;
  emotion?: EmotionalState;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
};

/**
 * Visible Thinking — warm amber breath while Shari composes a reply.
 */
export function VisibleThinkingBubble({
  message,
  emotion = "unclear",
  workspacePanel = null,
  workspaceActiveBeside = false,
}: Props) {
  useCompanionPresence({
    compact: true,
    emotion,
    isThinking: true,
    thinkingMessage: message,
    workspacePanel,
    workspaceActiveBeside,
  });

  return (
    <div
      className="companion-chat-thinking companion-fade-in"
      aria-live="polite"
      aria-label="Shari is thinking"
      data-testid="visible-thinking-bubble"
    >
      <span className="companion-chat-thinking__pulse" aria-hidden />
      <p className="companion-chat-thinking__copy">{message}</p>
    </div>
  );
}
