"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearBrainDumpDraft,
  getBrainDumps,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { ClearMyMindConservatoryWorkspace } from "@/components/companion/ClearMyMindConservatoryWorkspace";
import { ClearMyMindResultsWorkspace } from "@/components/companion/ClearMyMindResultsWorkspace";
import { ClearMyMindSessionEnd } from "@/components/companion/ClearMyMindSessionEnd";
import { ClearMyMindSessionFilter } from "@/components/companion/ClearMyMindSessionFilter";
import { ClearMyMindSessionPrioritize } from "@/components/companion/ClearMyMindSessionPrioritize";
import { ClearMyMindSessionConvert } from "@/components/companion/ClearMyMindSessionConvert";
import { CompanionWorkspaceShell } from "@/components/companion/CompanionWorkspaceShell";
import { MyThinkingSpacePanel } from "@/components/companion/MyThinkingSpacePanel";
import { BrainDumpVisualPanel } from "@/components/visual-thinking/BrainDumpVisualPanel";
import { SaveDestinationDialog } from "@/components/companion/SaveDestinationDialog";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_CONTINUE_LATER_ACK,
  CLEAR_MY_MIND_SAVED_ACK,
} from "@/lib/clearMyMindCopy";
import {
  exitClearMyMindMode,
  setClearMyMindModePhase,
} from "@/lib/clearMyMind/clearMyMindMode";
import { buildClearMyMindSessionSummary } from "@/lib/clearMyMindResultBuckets";
import {
  clearClearMyMindPersistedSession,
  pauseClearMyMindSession,
  resumeClearMyMindSession,
} from "@/lib/clearMyMindSessionStore";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";
import { applyThoughtAction } from "@/lib/thoughtActions";
import type { SparkVisualEngineOpenRequest } from "@/lib/sparkVisualEngine";
import type { SaveDestinationId } from "@/lib/saveDestinations";

type PanelView =
  | "capture"
  | "organize"
  | "filter"
  | "prioritize"
  | "convert"
  | "visual"
  | "session-end"
  | "my-thoughts";

/**
 * Clear My Mind — intelligent thinking workspace.
 * Capture → Continue → Spark analyzes → workflows launch real work.
 */
export function BrainDumpPanel({
  onOpen,
  onSuggestOpen: _onSuggestOpen,
  onContextChange,
  contextBanner,
  initialView = "capture",
  onBackToChat,
  onVisualizeThis,
}: {
  onOpen?: (section: AppSection) => void;
  onSuggestOpen?: (section: AppSection) => void;
  contextBanner?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  standalone?: boolean;
  initialView?: "capture" | "my-thoughts";
  onBackToChat: () => void;
  onVisualizeThis?: (request: SparkVisualEngineOpenRequest) => void;
}) {
  const resumed = useMemo(() => resumeClearMyMindSession(), []);
  const [captureSessionId] = useState(
    () => resumed?.sessionId ?? newCaptureSessionId(),
  );
  /** Always open to the capture area — resume keeps the session, not the last workflow screen. */
  const [panelView, setPanelView] = useState<PanelView>(() =>
    initialView === "my-thoughts" ? "my-thoughts" : "capture",
  );
  const [captureSurface, setCaptureSurface] = useState<"writing" | "choice">(
    "writing",
  );
  const [stage, setStage] = useState<ClearMyMindStage>("permission");
  const [sessionEntries, setSessionEntries] = useState<BrainDumpEntry[]>([]);
  const [laterAck, setLaterAck] = useState<string | null>(null);
  const [saveAck, setSaveAck] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    if (initialView === "my-thoughts") {
      setPanelView("my-thoughts");
      setClearMyMindModePhase("organize");
    }
  }, [initialView]);

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    onContextChange?.({
      view:
        panelView === "capture"
          ? "capture"
          : panelView === "organize"
            ? "relief"
            : "choice",
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

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  useEffect(() => {
    const phase =
      panelView === "capture"
        ? captureSurface === "choice"
          ? "choice"
          : "capture"
        : panelView === "my-thoughts"
          ? "choice"
          : panelView;
    pauseClearMyMindSession({
      sessionId: captureSessionId,
      phase,
      rawCaptureTexts: sessionEntries.map((e) => e.text),
    });
  }, [captureSessionId, panelView, captureSurface, sessionEntries]);

  const summary = useMemo(
    () => buildClearMyMindSessionSummary(sessionEntries),
    [sessionEntries],
  );

  const seedText = useMemo(
    () => sessionEntries.map((e) => e.text).filter(Boolean).join("\n"),
    [sessionEntries],
  );

  const contextBannerNode = contextBanner ? (
    <div className="companion-workspace-banner">{contextBanner}</div>
  ) : null;

  function goChoice() {
    setClearMyMindModePhase("capture");
    setCaptureSurface("choice");
    setPanelView("capture");
  }

  function exitToChat(clearSession: boolean) {
    // Pause current capture before leaving so Back to Chat can resume later.
    if (!clearSession) {
      pauseClearMyMindSession({
        sessionId: captureSessionId,
        phase:
          panelView === "capture"
            ? captureSurface === "choice"
              ? "choice"
              : "capture"
            : panelView === "my-thoughts"
              ? "choice"
              : panelView === "organize" ||
                  panelView === "filter" ||
                  panelView === "prioritize" ||
                  panelView === "convert" ||
                  panelView === "visual" ||
                  panelView === "session-end"
                ? panelView
                : "capture",
        rawCaptureTexts: sessionEntries.map((e) => e.text),
      });
    } else {
      clearClearMyMindPersistedSession();
    }
    exitClearMyMindMode();
    onBackToChat();
  }

  function launchVisualize() {
    if (onVisualizeThis) {
      onVisualizeThis({
        source: "clear-my-mind",
        seedText: seedText || undefined,
        title: "Clear My Mind",
      });
      return;
    }
    setClearMyMindModePhase("visual");
    setPanelView("visual");
  }

  function applySaveDestination(destination: SaveDestinationId) {
    setSaveDialogOpen(false);
    if (destination === "projects") {
      for (const entry of sessionEntries) {
        applyThoughtAction(entry, "move-to-project");
      }
      refreshEntries();
      setSaveAck("Saved toward Projects. Open Projects to continue.");
      onOpen?.("projects");
      return;
    }
    if (destination === "decision-compass") {
      const first = sessionEntries[0];
      if (first) applyThoughtAction(first, "decision");
      for (const entry of sessionEntries.slice(1)) {
        applyThoughtAction(entry, "keep-here");
      }
      refreshEntries();
      setSaveAck("Opening Decision Compass with your first thought.");
      onOpen?.("decision-compass");
      return;
    }
    if (destination === "visual-thinking") {
      for (const entry of sessionEntries) {
        applyThoughtAction(entry, "keep-here");
      }
      refreshEntries();
      launchVisualize();
      setSaveAck("Opening the Spark Visual Engine with your thoughts.");
      return;
    }
    if (destination === "documents" || destination === "snippets") {
      for (const entry of sessionEntries) {
        applyThoughtAction(entry, "keep-here");
      }
      refreshEntries();
      setSaveAck(CLEAR_MY_MIND_SAVED_ACK);
      setPanelView("my-thoughts");
      return;
    }
    for (const entry of sessionEntries) {
      applyThoughtAction(entry, "keep-here");
    }
    refreshEntries();
    setSaveAck(CLEAR_MY_MIND_SAVED_ACK);
  }

  function renderWorkspaceBody() {
    if (panelView === "my-thoughts") {
      return (
        <MyThinkingSpacePanel
          onBack={goChoice}
          presenceEntryKey={sessionEntries.length}
        />
      );
    }

    if (panelView === "organize") {
      return (
        <div className="clear-my-mind-workspace-body" data-cmind-view="organize">
          <div className="clear-my-mind-session-tool__nav">
            <button type="button" onClick={goChoice} data-testid="cmm-organize-back">
              ← Workspace
            </button>
            <h2>Organize</h2>
          </div>
          <ClearMyMindResultsWorkspace
            entries={sessionEntries}
            onRefresh={refreshEntries}
            showAnalysisBanner
            onOpenVisualThinking={launchVisualize}
            onOpenMyThoughts={() => {
              for (const entry of sessionEntries) {
                applyThoughtAction(entry, "keep-here");
              }
              refreshEntries();
              setPanelView("my-thoughts");
            }}
            onReturnHome={() => setPanelView("session-end")}
          />
        </div>
      );
    }

    if (panelView === "filter") {
      return (
        <ClearMyMindSessionFilter
          entries={sessionEntries}
          onRefresh={refreshEntries}
          onBack={goChoice}
        />
      );
    }

    if (panelView === "prioritize") {
      return (
        <ClearMyMindSessionPrioritize
          entries={sessionEntries}
          onRefresh={refreshEntries}
          onBack={goChoice}
          onOpenPlanMyDay={() => onOpen?.("plan-my-day")}
        />
      );
    }

    if (panelView === "convert") {
      return (
        <ClearMyMindSessionConvert
          entries={sessionEntries}
          onRefresh={refreshEntries}
          onBack={goChoice}
          onOpen={onOpen}
        />
      );
    }

    if (panelView === "visual") {
      return (
        <div className="clear-my-mind-workspace-body" data-cmind-view="visual">
          <div className="clear-my-mind-session-tool__nav">
            <button type="button" onClick={goChoice} data-testid="cmm-visual-back">
              ← Workspace
            </button>
            <h2>Visualize</h2>
          </div>
          {onVisualizeThis ? (
            <div className="clear-my-mind-session-tool__spark">
              <p className="clear-my-mind-session-tool__hint">
                Opening the Spark Visual Engine with your thoughts…
              </p>
              <button
                type="button"
                className="clear-my-mind-session-tool__primary"
                data-testid="cmm-open-visual-engine"
                onClick={launchVisualize}
              >
                Open Spark Visual Engine
              </button>
            </div>
          ) : null}
          <BrainDumpVisualPanel
            entries={sessionEntries}
            variant="primary"
            initialVisible
            allowHide={false}
            expanded
          />
        </div>
      );
    }

    if (panelView === "session-end") {
      return (
        <ClearMyMindSessionEnd
          summary={{
            itemsCaptured: summary.itemsCaptured,
            projectsCreated: summary.projectsCreated,
            calendarItems: summary.calendarItems,
            waitingItems: summary.waitingItems,
            parkingLotItems: summary.parkingLotItems,
            referenceItems: summary.referenceItems,
            itemsOrganized: summary.itemsOrganized,
            savedForLater: summary.savedForLater,
          }}
          onContinue={() => {
            setClearMyMindModePhase("capture");
            setCaptureSurface("writing");
            setPanelView("capture");
          }}
          onReturnHome={() => exitToChat(true)}
          onSaveForLater={() => {
            pauseClearMyMindSession({
              sessionId: captureSessionId,
              phase: "choice",
              rawCaptureTexts: sessionEntries.map((e) => e.text),
            });
            exitToChat(false);
          }}
        />
      );
    }

    return (
      <>
        {laterAck || saveAck ? (
          <p className="clear-my-mind-capture-choice__ack" role="status">
            {laterAck ?? saveAck}
          </p>
        ) : null}
        <ClearMyMindSession
          key={captureSessionId}
          sessionId={captureSessionId}
          initialSurface={captureSurface}
          onSessionEntriesChange={setSessionEntries}
          onPresenceStateChange={(state) => {
            setStage(state.stage);
            setCaptureSurface(state.surface);
          }}
          onAction={(action) => {
            setLaterAck(null);
            setSaveAck(null);
            if (action === "organize") {
              setPanelView("organize");
              return;
            }
            if (action === "visualize") {
              launchVisualize();
              return;
            }
            if (action === "filter") {
              setPanelView("filter");
              return;
            }
            if (action === "prioritize") {
              setPanelView("prioritize");
              return;
            }
            if (action === "convert") {
              setPanelView("convert");
              return;
            }
            if (action === "save") {
              setSaveDialogOpen(true);
              return;
            }
            if (action === "my-thoughts") {
              for (const entry of sessionEntries) {
                applyThoughtAction(entry, "keep-here");
              }
              refreshEntries();
              setPanelView("my-thoughts");
              return;
            }
            if (action === "continue-later") {
              pauseClearMyMindSession({
                sessionId: captureSessionId,
                phase: "choice",
                rawCaptureTexts: sessionEntries.map((e) => e.text),
              });
              setLaterAck(CLEAR_MY_MIND_CONTINUE_LATER_ACK);
              window.setTimeout(() => exitToChat(false), 900);
              return;
            }
            if (action === "exit") {
              setPanelView("session-end");
            }
          }}
        />
        <SaveDestinationDialog
          open={saveDialogOpen}
          title="Save your thoughts"
          suggested="documents"
          suggestionReason="My Thoughts keeps them ready to filter, print, or create from later."
          onCancel={() => setSaveDialogOpen(false)}
          onSave={applySaveDestination}
        />
      </>
    );
  }

  return (
    <div
      className="companion-fade-in clear-my-mind-room-shell clear-my-mind-workspace h-full min-h-0"
      data-cmind-mode={panelView === "capture" ? "capture" : panelView}
      data-cmind-view={panelView}
    >
      <CompanionWorkspaceShell
        roomId="clear-my-mind"
        hideHeader
        banner={contextBannerNode}
      >
        <ClearMyMindConservatoryWorkspace onBackToChat={() => exitToChat(false)}>
          {renderWorkspaceBody()}
        </ClearMyMindConservatoryWorkspace>
      </CompanionWorkspaceShell>
    </div>
  );
}
