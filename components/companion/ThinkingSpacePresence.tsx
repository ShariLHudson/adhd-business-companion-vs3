"use client";

import { useMemo } from "react";
import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { MY_THOUGHTS_PRESENCE_LINES } from "@/lib/thinkingSpace/copy";
import { ClearMyMindPresenceBubble } from "@/components/companion/ClearMyMindPresenceBubble";

type Props = {
  thoughtCount: number;
  workspaceEntryKey?: number;
};

/** Voice-only — no floating portrait inside the workspace (Companion Workspace Standard v1). */
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
      className="companion-workspace-voice-chip"
      aria-label="Shari"
      data-testid="thinking-space-presence"
    >
      <ClearMyMindPresenceBubble
        presence={presence}
        message={message}
        className="companion-workspace-voice-chip__bubble"
      />
    </div>
  );
}
