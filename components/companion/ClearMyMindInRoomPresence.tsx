"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import { shariReceiveAcknowledgment, shariReflectingLine } from "@/lib/clearMyMindCompanionVoice";
import {
  unfoldReached,
  type ClearMyMindUnfoldStep,
} from "@/lib/clearMyMindUnfold";
import { useClearMyMindCompanionPresence } from "@/lib/useClearMyMindCompanionPresence";
import { ClearMyMindPresenceBubble } from "@/components/companion/ClearMyMindPresenceBubble";

type Props = {
  stage: ClearMyMindStage;
  entries: BrainDumpEntry[];
  shareConfirming?: boolean;
  holdAck?: string | null;
  unfoldStep?: ClearMyMindUnfoldStep;
  workspaceEntryKey?: number;
};

/**
 * Shari in the room — voice only after a share, never a portrait or idle floating line.
 */
export function ClearMyMindInRoomPresence({
  stage,
  entries,
  shareConfirming = false,
  holdAck = null,
  unfoldStep = "idle",
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
    if (inCapture && holdAck) return holdAck;
    if (unfoldStep === "reflecting") {
      return shariReflectingLine(entries.length);
    }
    if (unfoldStep === "received" && holdAck) return holdAck;
    if (stage === "received") return acknowledgment;
    if (stage === "understanding" && !showingPatterns) {
      return presence.thinkingMessage;
    }
    return null;
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
  ]);

  if (!bubbleMessage) return null;

  return (
    <div
      className="clear-my-mind-in-room"
      aria-label="Shari"
      data-testid="clear-my-mind-in-room-presence"
      data-cmind-stage={stage}
      data-companion-phase={presence.reason}
    >
      <ClearMyMindPresenceBubble
        presence={presence}
        message={bubbleMessage}
        className="clear-my-mind-in-room-voice"
      />
    </div>
  );
}
