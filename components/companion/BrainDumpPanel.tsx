"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearBrainDumpDraft,
  getBrainDumps,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { ClearMyMindConservatoryWorkspace } from "@/components/companion/ClearMyMindConservatoryWorkspace";
import { ClearMyMindResultsWorkspace } from "@/components/companion/ClearMyMindResultsWorkspace";
import { ClearMyMindCompanionSuggestions } from "@/components/companion/ClearMyMindCompanionSuggestions";
import { ClearMyMindMemoryPermission } from "@/components/companion/ClearMyMindMemoryPermission";
import { CompanionWorkspaceShell } from "@/components/companion/CompanionWorkspaceShell";
import { MyThinkingSpacePanel } from "@/components/companion/MyThinkingSpacePanel";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import { NAV_CLEAR_MY_MIND } from "@/lib/navigationBack";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import { useClearMyMindUnfold } from "@/lib/useClearMyMindUnfold";
import { unfoldReached } from "@/lib/clearMyMindUnfold";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";

type PanelView = "capture" | "my-thoughts";

/**
 * Clear My Mind — Garden Conservatory standalone room.
 */
export function BrainDumpPanel({
  onOpen: _onOpen,
  onSuggestOpen: _onSuggestOpen,
  onContextChange,
  contextBanner,
  initialView = "capture",
  onBackToChat,
}: {
  onOpen?: (section: AppSection) => void;
  onSuggestOpen?: (section: AppSection) => void;
  contextBanner?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  standalone?: boolean;
  initialView?: PanelView;
  onBackToChat: () => void;
}) {
  const [captureSessionId] = useState(newCaptureSessionId);
  const [panelView, setPanelView] = useState<PanelView>(initialView);
  const [presenceEntryKey, setPresenceEntryKey] = useState(0);
  const [stage, setStage] = useState<ClearMyMindStage>("permission");
  const [holdAck, setHoldAck] = useState<string | null>(null);
  const [shareConfirming, setShareConfirming] = useState(false);
  const [lastShareItemCount, setLastShareItemCount] = useState(0);
  const [sessionEntries, setSessionEntries] = useState<BrainDumpEntry[]>([]);
  const [memoryAskOpen, setMemoryAskOpen] = useState(false);
  const [memoryGranted, setMemoryGranted] = useState(false);

  const { step: unfoldStep } = useClearMyMindUnfold(holdAck, lastShareItemCount);

  useEffect(() => {
    setPanelView(initialView);
  }, [initialView]);

  useEffect(() => {
    setPresenceEntryKey((key) => key + 1);
  }, [panelView]);

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    onContextChange?.({
      view: panelView === "capture" ? "capture" : "relief",
      stage: panelView === "capture" ? stage : "choice",
    });
  }, [panelView, stage, onContextChange]);

  const refreshEntries = useCallback(() => {
    setSessionEntries(
      getBrainDumps().filter(
        (e) =>
          e.captureSessionId === captureSessionId &&
          isVisibleInMentalLandscape(e),
      ),
    );
  }, [captureSessionId]);

  const contextBannerNode = contextBanner ? (
    <div className="companion-workspace-banner">{contextBanner}</div>
  ) : null;

  if (panelView === "my-thoughts") {
    return (
      <div
        className="companion-fade-in clear-my-mind-room-shell h-full min-h-0"
        data-cmind-view="my-thoughts"
      >
        <CompanionWorkspaceShell
          roomId="clear-my-mind"
          workspaceId="clear-my-mind-thoughts"
          hideHeader
          banner={contextBannerNode}
        >
          <ClearMyMindConservatoryWorkspace onBackToChat={onBackToChat}>
            <MyThinkingSpacePanel
              backDestination={NAV_CLEAR_MY_MIND}
              onBack={() => setPanelView("capture")}
              presenceEntryKey={presenceEntryKey}
            />
          </ClearMyMindConservatoryWorkspace>
        </CompanionWorkspaceShell>
      </div>
    );
  }

  const showResults = unfoldReached(unfoldStep, "holding") && sessionEntries.length > 0;
  const showSuggestions = unfoldReached(unfoldStep, "possibility");

  return (
    <div
      className="companion-fade-in clear-my-mind-room-shell clear-my-mind-workspace h-full min-h-0"
      data-cmind-mode="capture"
      data-cmind-view="capture"
    >
      <CompanionWorkspaceShell
        roomId="clear-my-mind"
        hideHeader
        banner={contextBannerNode}
      >
        <ClearMyMindConservatoryWorkspace onBackToChat={onBackToChat}>
          <ClearMyMindSession
            key={captureSessionId}
            sessionId={captureSessionId}
            onOpenMyThoughts={() => setPanelView("my-thoughts")}
            onSessionEntriesChange={setSessionEntries}
            onPresenceStateChange={(state) => {
              setStage(state.stage);
              setHoldAck(state.holdAck);
              setShareConfirming(state.shareConfirming);
              setLastShareItemCount(state.lastShareItemCount);
            }}
          />

          {showResults ? (
            <ClearMyMindResultsWorkspace
              entries={sessionEntries}
              onRefresh={refreshEntries}
            />
          ) : null}

          {showSuggestions ? (
            <ClearMyMindCompanionSuggestions
              seed={sessionEntries.length}
              onPick={(line) => {
                if (line.toLowerCase().includes("organize") && !memoryGranted) {
                  setMemoryAskOpen(true);
                }
              }}
            />
          ) : null}

          <ClearMyMindMemoryPermission
            open={memoryAskOpen}
            onYes={() => {
              setMemoryGranted(true);
              setMemoryAskOpen(false);
            }}
            onNo={() => setMemoryAskOpen(false)}
          />
        </ClearMyMindConservatoryWorkspace>
      </CompanionWorkspaceShell>
    </div>
  );
}
