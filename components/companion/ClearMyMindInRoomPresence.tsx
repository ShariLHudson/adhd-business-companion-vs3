"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import { shariReceiveAcknowledgment, shariReflectingLine } from "@/lib/clearMyMindCompanionVoice";
import { clearMyMindHeldCountLine } from "@/lib/clearMyMindCopy";
import {
  unfoldReached,
  type ClearMyMindUnfoldStep,
} from "@/lib/clearMyMindUnfold";
import { useClearMyMindCompanionPresence } from "@/lib/useClearMyMindCompanionPresence";
import { ShariPortrait } from "@/components/companion/ShariPortrait";
import { ClearMyMindPresenceBubble } from "@/components/companion/ClearMyMindPresenceBubble";

type Props = {
  stage: ClearMyMindStage;
  entries: BrainDumpEntry[];
  shareConfirming?: boolean;
  holdAck?: string | null;
  unfoldStep?: ClearMyMindUnfoldStep;
  totalThoughtCount?: number;
  workspaceEntryKey?: number;
};

/**
 * Shari in the room — integrated presence, not a sidebar.
 */
export function ClearMyMindInRoomPresence({
  stage,
  entries,
  shareConfirming = false,
  holdAck = null,
  unfoldStep = "idle",
  totalThoughtCount = 0,
  workspaceEntryKey = 0,
}: Props) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  const showingPatterns =
    unfoldReached(unfoldStep, "patterns") && graph.hasContent;

  const presence = useClearMyMindCompanionPresence({
    stage,
    shareConfirming,
    holdAck,
    showingPatterns,
    unfoldStep,
    workspaceEntryKey,
  });

  const acknowledgment = shariReceiveAcknowledgment(entries);
  const inCapture = stage === "permission" || stage === "release";

  const bubbleMessage = useMemo(() => {
    if (shareConfirming) return presence.thinkingMessage;
    // Post-Share companion response — always show in capture (unfold is idle in V1).
    if (inCapture && holdAck) return holdAck;
    if (unfoldStep === "reflecting") {
      return shariReflectingLine(entries.length);
    }
    if (unfoldStep === "received" && holdAck) return holdAck;
    if (stage === "received") return acknowledgment;
    if (stage === "understanding" && !showingPatterns) {
      return presence.thinkingMessage;
    }
    if (inCapture && !holdAck && unfoldStep === "idle") {
      if (totalThoughtCount > 0 && !shareConfirming) {
        return clearMyMindHeldCountLine(totalThoughtCount);
      }
      return presence.thinkingMessage;
    }
    return presence.thinkingMessage;
  }, [
    shareConfirming,
    presence.thinkingMessage,
    unfoldStep,
    entries.length,
    inCapture,
    holdAck,
    stage,
    acknowledgment,
    showingPatterns,
    totalThoughtCount,
  ]);

  return (
    <div
      className="clear-my-mind-in-room"
      aria-label="Shari"
      data-testid="clear-my-mind-in-room-presence"
      data-cmind-stage={stage}
      data-companion-phase={presence.reason}
    >
      <div className="clear-my-mind-in-room-inner">
        <div className="clear-my-mind-in-room-voice-wrap">
          <ClearMyMindPresenceBubble
            presence={presence}
            message={bubbleMessage}
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
