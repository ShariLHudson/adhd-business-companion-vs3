"use client";

import { ShariPortrait } from "@/components/companion/ShariPortrait";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { useCompanionPresence } from "@/lib/useCompanionPresence";

const RING: Record<EmotionalState, string> = {
  focused: "#2e8b57",
  building: "#1e4f4f",
  overwhelmed: "#d4a574",
  emotional: "#4a6fa5",
  stuck: "#9a8f82",
  unclear: "#b8a98f",
};

type Props = {
  message: string;
  emotion?: EmotionalState;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
};

/**
 * Visible Thinking — small Shari portrait beside relational wait copy.
 */
export function VisibleThinkingBubble({
  message,
  emotion = "unclear",
  workspacePanel = null,
  workspaceActiveBeside = false,
}: Props) {
  const ring = RING[emotion] ?? RING.unclear;
  const presence = useCompanionPresence({
    compact: true,
    emotion,
    isThinking: true,
    thinkingMessage: message,
    workspacePanel,
    workspaceActiveBeside,
  });

  return (
    <div
      className="flex max-w-[90%] items-start gap-2.5 companion-fade-in"
      aria-live="polite"
      aria-label="Shari is thinking"
      data-testid="visible-thinking-bubble"
    >
      <div
        className="presence-glow shrink-0 rounded-full p-0.5"
        style={{ boxShadow: `0 0 0 2px ${ring}55, 0 0 10px ${ring}24` }}
      >
        <ShariPortrait
          presence={presence}
          size="compact"
          ringColor={ring}
          alt=""
        />
      </div>
      <p className="rounded-2xl bg-white/85 px-4 py-3 text-sm italic leading-relaxed text-[#6b635a] shadow-sm backdrop-blur-sm">
        {message}
      </p>
    </div>
  );
}
