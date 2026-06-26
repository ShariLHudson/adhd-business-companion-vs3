"use client";

import { useCallback, useEffect, useState } from "react";
import { clearBrainDumpDraft } from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { CompanionWorkspaceShell } from "@/components/companion/CompanionWorkspaceShell";
import { MyThinkingSpacePanel } from "@/components/companion/MyThinkingSpacePanel";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import { NAV_CLEAR_MY_MIND } from "@/lib/navigationBack";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";

type PanelView = "capture" | "my-thoughts";

/**
 * Clear My Mind™ — Companion Workspace Standard v1.
 * Journal table at the Window Seat; room stays visible around the workspace.
 */
export function BrainDumpPanel({
  onOpen: _onOpen,
  onSuggestOpen: _onSuggestOpen,
  onContextChange,
  contextBanner,
}: {
  onOpen?: (section: AppSection) => void;
  onSuggestOpen?: (section: AppSection) => void;
  contextBanner?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  standalone?: boolean;
}) {
  const [captureSessionId] = useState(newCaptureSessionId);
  const [panelView, setPanelView] = useState<PanelView>("capture");
  const [presenceEntryKey, setPresenceEntryKey] = useState(0);

  useEffect(() => {
    setPresenceEntryKey((key) => key + 1);
  }, [panelView]);

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    onContextChange?.({
      view: panelView === "capture" ? "capture" : "relief",
      stage: panelView === "capture" ? "release" : "choice",
    });
  }, [panelView, onContextChange]);

  const contextBannerNode = contextBanner ? (
    <div className="companion-workspace-banner">{contextBanner}</div>
  ) : null;

  if (panelView === "my-thoughts") {
    return (
      <div
        className="companion-fade-in h-full min-h-0"
        data-cmind-view="my-thoughts"
      >
        <CompanionWorkspaceShell
          roomId="clear-my-mind"
          workspaceId="clear-my-mind-thoughts"
          banner={contextBannerNode}
        >
          <MyThinkingSpacePanel
            backDestination={NAV_CLEAR_MY_MIND}
            onBack={() => setPanelView("capture")}
            presenceEntryKey={presenceEntryKey}
          />
        </CompanionWorkspaceShell>
      </div>
    );
  }

  return (
    <div
      className="companion-fade-in h-full min-h-0"
      data-cmind-mode="capture"
      data-cmind-view="capture"
    >
      <CompanionWorkspaceShell roomId="clear-my-mind" banner={contextBannerNode}>
        <ClearMyMindSession
          key={captureSessionId}
          sessionId={captureSessionId}
          onOpenMyThoughts={() => setPanelView("my-thoughts")}
        />
      </CompanionWorkspaceShell>
    </div>
  );
}
