"use client";

import { useCallback, useEffect, useState } from "react";
import { clearBrainDumpDraft, type BrainDumpEntry } from "@/lib/companionStore";
import { ClearMyMindSession } from "@/components/companion/ClearMyMindSession";
import { BrainDumpVisualPanel } from "@/components/visual-thinking/BrainDumpVisualPanel";
import { newCaptureSessionId } from "@/lib/clearMyMindCapture";
import {
  CLEAR_MY_MIND_CAPTURE_EXAMPLE,
  CLEAR_MY_MIND_CAPTURE_GUIDANCE,
  CLEAR_MY_MIND_HEADER,
} from "@/lib/clearMyMindCopy";
import type { AppSection } from "@/lib/companionUi";
import type { WorkspacePanelDetail } from "@/lib/workspaceAwareness";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

export function BrainDumpPanel({
  onOpen,
  onSuggestOpen,
  onContextChange,
  contextBanner,
  /** Full-width layout when opened standalone from top navigation. */
  standalone = false,
}: {
  onOpen?: (section: AppSection) => void;
  onSuggestOpen?: (section: AppSection) => void;
  contextBanner?: string | null;
  onContextChange?: (detail: WorkspacePanelDetail) => void;
  standalone?: boolean;
}) {
  const [captureSessionId] = useState(newCaptureSessionId);
  const [landscapeActive, setLandscapeActive] = useState(false);
  const [sessionVisualEntries, setSessionVisualEntries] = useState<
    BrainDumpEntry[]
  >([]);

  useEffect(() => {
    clearBrainDumpDraft();
  }, []);

  useEffect(() => {
    onContextChange?.({
      view: landscapeActive ? "relief" : "capture",
      stage: landscapeActive ? "mental landscape" : "capture session",
    });
  }, [landscapeActive, onContextChange]);

  const suggestOpen = onSuggestOpen ?? onOpen;
  const handleLandscapeActiveChange = useCallback((active: boolean) => {
    setLandscapeActive(active);
  }, []);

  const fullWidth = standalone || landscapeActive;

  return (
    <div
      className={`companion-fade-in flex h-full min-h-0 flex-col ${
        landscapeActive
          ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,48%)]"
          : "lg:flex-row"
      }`}
    >
      <div
        className={`${workspacePanelShellClass({ width: "full", inSplit: !fullWidth })} min-w-0 overflow-y-auto ${
          landscapeActive ? "lg:min-h-0" : "flex-1"
        }`}
      >
        {contextBanner ? (
          <div className="mb-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/5 px-4 py-3 text-sm leading-relaxed text-[#2d2926]">
            {contextBanner}
          </div>
        ) : null}
        {!landscapeActive ? (
          <>
            <WorkspaceAreaWorksGuide areaId="brain-dump" />
            <p className="text-2xl font-semibold text-[#1f1c19]">Clear My Mind</p>
            <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_HEADER}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
              {CLEAR_MY_MIND_CAPTURE_GUIDANCE}
            </p>
            <p className="mt-1 text-sm italic text-[#9a8f82]">
              e.g. {CLEAR_MY_MIND_CAPTURE_EXAMPLE}
            </p>
          </>
        ) : (
          <p className="text-xl font-semibold text-[#1f1c19]">Clear My Mind</p>
        )}

        <div className={landscapeActive ? "mt-3" : "mt-5"}>
          <ClearMyMindSession
            key={captureSessionId}
            sessionId={captureSessionId}
            onOpen={suggestOpen}
            onSessionEntriesChange={setSessionVisualEntries}
            onLandscapeActiveChange={handleLandscapeActiveChange}
          />
        </div>
      </div>
      <BrainDumpVisualPanel
        entries={sessionVisualEntries}
        hideClusterCenter={landscapeActive}
        expanded={landscapeActive}
      />
    </div>
  );
}
