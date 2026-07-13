"use client";

import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { ShariPresenceFlame } from "@/components/companion/ShariPresenceFlame";
import { ShariPresenceState } from "@/lib/shariPresenceFlame/types";

type Props = {
  message: string;
  emotion?: EmotionalState;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
};

/**
 * Visible presence — SSC flame while Shari composes a reply.
 * No “Thinking…” software label; the flame is the presence.
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
    thinkingMessage: message || undefined,
    workspacePanel,
    workspaceActiveBeside,
  });

  const showCopy = Boolean(message.trim());

  return (
    <div
      className="companion-chat-thinking companion-fade-in"
      aria-live="polite"
      aria-label="Shari is with you"
      data-testid="visible-thinking-bubble"
    >
      <ShariPresenceFlame
        state={ShariPresenceState.THINKING}
        size="md"
        label="Shari is with you"
        className="companion-chat-thinking__flame"
      />
      {showCopy ? (
        <p className="companion-chat-thinking__copy">{message}</p>
      ) : null}
    </div>
  );
}
