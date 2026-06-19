"use client";

import { useRef, useState } from "react";
import type { PersistedDecisionCompassSession } from "@/lib/decisionCompassSessionStore";
import {
  buildDecisionCanvasGraph,
  buildDecisionMapView,
} from "@/lib/decisionCanvasModel";
import {
  exportDecisionVisualPdf,
  exportDecisionVisualPng,
  printDecisionVisual,
} from "@/lib/decisionCanvasExport";
import { buildDecisionRecommendationReport } from "@/lib/decisionRecommendationReport";
import { SaveStatusBanner } from "@/components/companion/SaveStatusBanner";
import {
  loadDecisionMapVisible,
  loadDecisionVisualView,
  saveDecisionMapVisible,
  saveDecisionVisualView,
  type DecisionVisualViewMode,
} from "@/lib/decisionMapPreference";
import { DecisionInfographic } from "./DecisionInfographic";
import { DecisionRecommendationReport } from "./DecisionRecommendationReport";
import { DecisionCompassExploration } from "./DecisionCompassExploration";
import { VisualMindMap } from "./VisualMindMap";

export function DecisionVisualPanel({
  session,
  onSessionChange,
  projectId = null,
  projectName = null,
}: {
  session: PersistedDecisionCompassSession | null;
  onSessionChange?: (next: PersistedDecisionCompassSession) => void;
  projectId?: string | null;
  projectName?: string | null;
}) {
  const [visible, setVisible] = useState(loadDecisionMapVisible);
  const [viewMode, setViewMode] = useState<DecisionVisualViewMode>(
    loadDecisionVisualView,
  );
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const vm = buildDecisionMapView(session);
  const graph = buildDecisionCanvasGraph(session);
  const report = buildDecisionRecommendationReport(session);

  function toggleVisible() {
    const next = !visible;
    setVisible(next);
    saveDecisionMapVisible(next);
  }

  function switchView(mode: DecisionVisualViewMode) {
    setViewMode(mode);
    saveDecisionVisualView(mode);
  }

  async function handlePng() {
    setExporting(true);
    try {
      await exportDecisionVisualPng(vm, graph);
    } finally {
      setExporting(false);
    }
  }

  async function handlePdf() {
    setExporting(true);
    try {
      await exportDecisionVisualPdf(session);
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    printDecisionVisual(exportRef.current, report);
  }

  if (!visible) {
    return (
      <div className="flex shrink-0 items-center justify-center border-t border-[#e7dfd4] bg-[#faf7f2]/90 px-3 py-2 lg:border-t-0 lg:border-l">
        <button
          type="button"
          onClick={toggleVisible}
          className="rounded-full bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          🗺️ Show Decision Canvas
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-col border-t border-[#e7dfd4] bg-gradient-to-b from-[#faf7f2] to-[#f5efe6] lg:w-[min(42%,420px)] lg:shrink-0 lg:border-t-0 lg:border-l"
      data-testid="decision-visual-panel"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e7dfd4]/80 bg-white/70 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Visual Canvas
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => switchView("mindmap")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              viewMode === "mindmap"
                ? "bg-[#1e4f4f] text-white"
                : "text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
            }`}
          >
            Mind Map
          </button>
          <button
            type="button"
            onClick={() => switchView("infographic")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              viewMode === "infographic"
                ? "bg-[#1e4f4f] text-white"
                : "text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
            }`}
          >
            Infographic
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handlePng()}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5"
            title="Export PNG"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={handlePdf}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5"
            title="Export PDF"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5"
          >
            Print
          </button>
          <button
            type="button"
            onClick={toggleVisible}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5"
          >
            Hide
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {viewMode === "mindmap" ? (
          <VisualMindMap session={session} />
        ) : (
          <DecisionInfographic session={session} />
        )}
        <DecisionRecommendationReport session={session} />
        <DecisionCompassExploration
          session={session}
          onSessionChange={onSessionChange}
          projectId={projectId}
          projectName={projectName}
          onExportPdf={() => void handlePdf()}
          onExportPng={() => void handlePng()}
          onPrint={handlePrint}
        />
        <div className="px-4 pb-4">
          <SaveStatusBanner level="resume" />
        </div>
      </div>

      {/* Always-mounted export source — matches infographic layout for PNG/print */}
      <div className="sr-only" aria-hidden ref={exportRef}>
        <DecisionInfographic session={session} />
      </div>
    </div>
  );
}
