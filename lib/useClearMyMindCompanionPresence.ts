"use client";

import { useMemo } from "react";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import type { ClearMyMindUnfoldStep } from "@/lib/clearMyMindUnfold";
import {
  clearMyMindPresenceIsThinking,
  resolveClearMyMindPresencePhase,
} from "@/lib/companionPresence";
import { useCompanionPresence } from "@/lib/useCompanionPresence";

export function useClearMyMindCompanionPresence(input: {
  stage: ClearMyMindStage;
  shareConfirming: boolean;
  holdAck: string | null;
  showingPatterns: boolean;
  unfoldStep?: ClearMyMindUnfoldStep;
  workspaceEntryKey?: number;
}) {
  const phase = useMemo(
    () =>
      resolveClearMyMindPresencePhase({
        stage: input.stage,
        shareConfirming: input.shareConfirming,
        holdAck: input.holdAck,
        showingPatterns: input.showingPatterns,
        unfoldStep: input.unfoldStep,
      }),
    [
      input.stage,
      input.shareConfirming,
      input.holdAck,
      input.showingPatterns,
      input.unfoldStep,
    ],
  );

  const isThinking =
    input.shareConfirming || clearMyMindPresenceIsThinking(phase);

  return useCompanionPresence({
    workspacePanel: "brain-dump",
    workspaceActiveBeside: true,
    presenceWorkspace: "clear-my-mind",
    presenceSurface: "clear-my-mind",
    workspaceEntryKey: input.workspaceEntryKey,
    clearMyMindPhase: phase,
    isThinking,
    emotion: "emotional",
  });
}
