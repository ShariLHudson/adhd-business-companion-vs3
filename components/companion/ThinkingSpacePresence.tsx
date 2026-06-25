"use client";

import { useMemo } from "react";
import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { MY_THOUGHTS_PRESENCE_LINES } from "@/lib/thinkingSpace/copy";
import { ShariPortrait } from "@/components/companion/ShariPortrait";
import { ClearMyMindPresenceBubble } from "@/components/companion/ClearMyMindPresenceBubble";

type Props = {
  thoughtCount: number;
  workspaceEntryKey?: number;
};

export function ThinkingSpacePresence({
  thoughtCount,
  workspaceEntryKey = 0,
}: Props) {
  const presence = useCompanionPresence({
    workspacePanel: "brain-dump",
    workspaceActiveBeside: true,
    presenceWorkspace: "my-thoughts",
    workspaceEntryKey,
    clearMyMindPhase: "supporting",
    isThinking: false,
    emotion: "emotional",
  });

  const message = useMemo(() => {
    const seed = thoughtCount + new Date().getMinutes();
    return MY_THOUGHTS_PRESENCE_LINES[
      Math.abs(seed) % MY_THOUGHTS_PRESENCE_LINES.length
    ];
  }, [thoughtCount]);

  return (
    <div
      className="clear-my-mind-in-room"
      aria-label="Shari"
      data-testid="thinking-space-presence"
    >
      <div className="clear-my-mind-in-room-inner">
        <div className="clear-my-mind-in-room-voice-wrap">
          <ClearMyMindPresenceBubble
            presence={presence}
            message={message}
            className="clear-my-mind-in-room-voice"
          />
        </div>
        <div className="flex flex-col items-center">
          <ShariPortrait presence={presence} size="in-room" alt="Shari" />
        </div>
      </div>
    </div>
  );
}
