"use client";

import { useRef, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import {
  exportBrainDumpVisualPdf,
  exportBrainDumpVisualPng,
  printBrainDumpVisual,
} from "@/lib/brainDumpCanvasExport";
import {
  loadBrainDumpVisualVisible,
  loadBrainDumpVisualView,
  saveBrainDumpVisualVisible,
  saveBrainDumpVisualView,
  type BrainDumpVisualViewMode,
} from "@/lib/brainDumpVisualPreference";
import { BrainDumpClusterView } from "./BrainDumpClusterView";
import { BrainDumpInfographic } from "./BrainDumpInfographic";
import { BrainDumpMindMapView } from "./BrainDumpMindMapView";

export function BrainDumpVisualPanel({
  entries,
}: {
  entries: BrainDumpEntry[];
}) {
  const [visible, setVisible] = useState(loadBrainDumpVisualVisible);
  const [viewMode, setViewMode] = useState<BrainDumpVisualViewMode>(
    loadBrainDumpVisualView,
  );
  const [exporting, setExporting] = useState(false);
  const infographicRef = useRef<HTMLDivElement>(null);
  const graph = buildBrainDumpClusterGraph(entries);

  function toggleVisible() {
    const next = !visible;
    setVisible(next);
    saveBrainDumpVisualVisible(next);
  }

  function switchView(mode: BrainDumpVisualViewMode) {
    setViewMode(mode);
    saveBrainDumpVisualView(mode);
  }

  if (!visible) {
    return (
      <div className="flex shrink-0 items-center justify-center border-t border-[#e7dfd4] bg-[#faf7f2]/90 px-3 py-2 lg:border-t-0 lg:border-l">
        <button
          type="button"
          onClick={toggleVisible}
          className="rounded-full bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          🧠 Show Thought Clusters
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-col border-t border-[#e7dfd4] bg-gradient-to-b from-[#faf7f2] to-[#f5efe6] lg:w-[min(42%,400px)] lg:shrink-0 lg:border-t-0 lg:border-l"
      data-testid="brain-dump-visual-panel"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e7dfd4]/80 bg-white/70 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          Thought Clusters
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ["cluster", "Clusters"],
              ["mindmap", "Connections"],
              ["infographic", "Summary"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchView(mode)}
              className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                viewMode === mode
                  ? "bg-[#1e4f4f] text-white"
                  : "text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            disabled={exporting || !graph.hasContent}
            onClick={() => {
              setExporting(true);
              void exportBrainDumpVisualPng(graph).finally(() => setExporting(false));
            }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5 disabled:opacity-40"
          >
            PNG
          </button>
          <button
            type="button"
            disabled={!graph.hasContent}
            onClick={() => exportBrainDumpVisualPdf(graph)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b635a] hover:bg-black/5 disabled:opacity-40"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => printBrainDumpVisual(infographicRef.current)}
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
        {viewMode === "cluster" ? (
          <BrainDumpClusterView entries={entries} />
        ) : viewMode === "mindmap" ? (
          <BrainDumpMindMapView entries={entries} />
        ) : (
          <BrainDumpInfographic entries={entries} exportRef={infographicRef} />
        )}
      </div>
    </div>
  );
}
