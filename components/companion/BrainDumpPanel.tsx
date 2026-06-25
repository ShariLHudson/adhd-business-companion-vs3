"use client";

import { useCallback, useEffect, useState } from "react";
import { clearBrainDumpDraft, type BrainDumpEntry } from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { ClearMyMindCompanionPanel } from "@/components/companion/ClearMyMindCompanionPanel";
import { BrainDumpVisualPanel } from "@/components/visual-thinking/BrainDumpVisualPanel";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_HEADER,
  CLEAR_MY_MIND_PERMISSION,
} from "@/lib/clearMyMindCopy";
import type { ClearMyMindChoiceId } from "@/lib/clearMyMindCompanionVoice";
import {
  clearMyMindShowsCompanionPanel,
  clearMyMindShowsExportTools,
  clearMyMindShowsVisualAnalysis,
  initialClearMyMindStage,
  stageOnAcknowledgmentContinue,
  type ClearMyMindStage,
} from "@/lib/clearMyMindStages";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function BrainDumpPanel({
  onOpen,
  onSuggestOpen,
  onContextChange,
  contextBanner,
  standalone = false,
}: {
  onOpen?: (section: AppSection) => void;
  onSuggestOpen?: (section: AppSection) => void;
  contextBanner?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  standalone?: boolean;
}) {
  const [captureSessionId] = useState(newCaptureSessionId);
  const [stage, setStage] = useState<ClearMyMindStage>(initialClearMyMindStage);
  const [sessionVisualEntries, setSessionVisualEntries] = useState<
    BrainDumpEntry[]
  >([]);
  const [selectedChoice, setSelectedChoice] = useState<ClearMyMindChoiceId | null>(
    null,
  );

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    const stageLabel =
      stage === "permission" || stage === "release"
        ? "release"
        : stage === "received"
          ? "received"
          : stage === "understanding"
            ? "understanding"
            : "choice";
    onContextChange?.({
      view: stage === "permission" || stage === "release" ? "capture" : "relief",
      stage: stageLabel,
    });
  }, [stage, onContextChange]);

  const suggestOpen = onSuggestOpen ?? onOpen;
  const showCompanion = clearMyMindShowsCompanionPanel(stage);
  const showVisual = clearMyMindShowsVisualAnalysis(stage);
  const showExport = clearMyMindShowsExportTools(stage);
  const twoColumn = showCompanion;

  const handleStageChange = useCallback((next: ClearMyMindStage) => {
    setStage(next);
  }, []);

  const handleContinueToUnderstanding = useCallback(() => {
    setStage(stageOnAcknowledgmentContinue(stage));
    window.setTimeout(() => {
      setStage("choice");
    }, 1200);
  }, [stage]);

  const handleChoice = useCallback((choiceId: ClearMyMindChoiceId) => {
    setSelectedChoice(choiceId);
    if (choiceId === "focus") {
      suggestOpen?.("focus-timer");
    }
  }, [suggestOpen]);

  const inCapture = stage === "permission" || stage === "release";

  return (
    <div
      className={`companion-fade-in flex h-full min-h-0 flex-col ${
        twoColumn
          ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]"
          : ""
      }`}
      data-cmind-stage={stage}
    >
      <div
        className={`${workspacePanelShellClass({ width: "full", inSplit: twoColumn })} min-w-0 overflow-y-auto ${
          twoColumn ? "lg:min-h-0" : "flex-1"
        }`}
      >
        {contextBanner ? (
          <div className="mb-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 px-4 py-3 text-sm leading-relaxed text-[#2d2926]">
            {contextBanner}
          </div>
        ) : null}

        {inCapture ? (
          <header className="mb-5 max-w-xl">
            <p className="text-2xl font-semibold text-[#1f1c19]">Clear My Mind</p>
            <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_HEADER}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_PERMISSION}
            </p>
          </header>
        ) : (
          <p className="mb-3 text-xl font-semibold text-[#1f1c19]">Clear My Mind</p>
        )}

        <ClearMyMindSession
          key={captureSessionId}
          sessionId={captureSessionId}
          stage={stage}
          onOpen={suggestOpen}
          onSessionEntriesChange={setSessionVisualEntries}
          onStageChange={handleStageChange}
          onChoice={handleChoice}
          selectedChoice={selectedChoice}
        />
      </div>

      {showCompanion ? (
        <ClearMyMindCompanionPanel
          stage={stage}
          entries={sessionVisualEntries}
          onContinueToUnderstanding={handleContinueToUnderstanding}
          onChoice={handleChoice}
          onOpen={suggestOpen}
          selectedChoice={selectedChoice}
        />
      ) : null}

      {showVisual && showExport ? (
        <BrainDumpVisualPanel
          entries={sessionVisualEntries}
          hideClusterCenter
          expanded={standalone}
          initialVisible={false}
          allowHide
        />
      ) : null}
    </div>
  );
}
