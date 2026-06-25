"use client";

import { useCallback, useEffect, useState } from "react";
import { clearBrainDumpDraft, type BrainDumpEntry } from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { ClearMyMindInRoomPresence } from "@/components/companion/ClearMyMindInRoomPresence";
import { MyThinkingSpacePanel } from "@/components/companion/MyThinkingSpacePanel";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_HEADER,
  CLEAR_MY_MIND_PERMISSION,
} from "@/lib/clearMyMindCopy";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

type PanelView = "capture" | "my-thoughts";

/**
 * Clear My Mind™ captures continuously.
 * My Thoughts™ organizes — separate view, always one tap away.
 */
export function BrainDumpPanel({
  onOpen,
  onSuggestOpen,
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
  const [sessionVisualEntries, setSessionVisualEntries] = useState<
    BrainDumpEntry[]
  >([]);
  const [shareConfirming, setShareConfirming] = useState(false);
  const [holdAck, setHoldAck] = useState<string | null>(null);
  const [totalThoughtCount, setTotalThoughtCount] = useState(0);
  const [panelView, setPanelView] = useState<PanelView>("capture");

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    onContextChange?.({
      view: panelView === "capture" ? "capture" : "relief",
      stage: panelView === "capture" ? "release" : "choice",
    });
  }, [panelView, onContextChange]);

  const handlePresenceStateChange = useCallback(
    (state: { shareConfirming: boolean; holdAck: string | null }) => {
      setShareConfirming(state.shareConfirming);
      setHoldAck(state.holdAck);
    },
    [],
  );

  if (panelView === "my-thoughts") {
    return (
      <div
        className="companion-fade-in h-full min-h-0"
        data-cmind-view="my-thoughts"
      >
        <div
          className={`${workspacePanelShellClass({ width: "full", inSplit: false })} min-w-0 overflow-y-auto`}
        >
          <div className="clear-my-mind-room">
            <MyThinkingSpacePanel onBack={() => setPanelView("capture")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="companion-fade-in h-full min-h-0"
      data-cmind-mode="capture"
      data-cmind-view="capture"
    >
      <div
        className={`${workspacePanelShellClass({ width: "full", inSplit: false })} min-w-0 overflow-y-auto`}
      >
        {contextBanner ? (
          <div className="mb-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 px-4 py-3 text-sm leading-relaxed text-[#2d2926]">
            {contextBanner}
          </div>
        ) : null}

        <div className="clear-my-mind-room">
          <header className="mb-2 max-w-xl pr-16 sm:pr-20">
            <p className="text-2xl font-semibold text-[#1f1c19]">
              Clear My Mind
            </p>
            <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_HEADER}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_PERMISSION}
            </p>
          </header>

          <ClearMyMindInRoomPresence
            stage="release"
            entries={sessionVisualEntries}
            shareConfirming={shareConfirming}
            holdAck={holdAck}
            unfoldStep="idle"
            totalThoughtCount={totalThoughtCount}
          />

          <div className="clear-my-mind-room-work">
            <ClearMyMindSession
              key={captureSessionId}
              sessionId={captureSessionId}
              onSessionEntriesChange={setSessionVisualEntries}
              onPresenceStateChange={handlePresenceStateChange}
              onOpenMyThoughts={() => setPanelView("my-thoughts")}
              onTotalThoughtCountChange={setTotalThoughtCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
