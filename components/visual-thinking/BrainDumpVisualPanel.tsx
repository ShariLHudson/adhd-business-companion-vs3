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
  variant = "sidebar",
  initialVisible,
  initialViewMode,
  allowHide = true,
  hideClusterCenter = false,
  /** Wider panel when Mental Landscape uses a two-column desktop layout. */
  expanded = false,
}: {
  entries: BrainDumpEntry[];
  /** Sidebar beside capture; primary fills the panel (mind map view). */
  variant?: "sidebar" | "primary";
  initialVisible?: boolean;
  initialViewMode?: BrainDumpVisualViewMode;
  allowHide?: boolean;
  /** Hide the center hub when relief landscape already shows "Everything is held." */
  hideClusterCenter?: boolean;
  expanded?: boolean;
}) {
  const [visible, setVisible] = useState(
    () => initialVisible ?? loadBrainDumpVisualVisible(),
  );
  const [viewMode, setViewMode] = useState<BrainDumpVisualViewMode>(
    () => initialViewMode ?? loadBrainDumpVisualView(),
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

  if (!visible && allowHide) {
    return (
      <div className="flex shrink-0 items-center justify-center border-t border-[#e7dfd4] bg-[#faf7f2]/90 px-3 py-2 lg:border-t-0 lg:border-l">
        <button
          type="button"
          onClick={toggleVisible}
          className="rounded-full bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white shadow-md"
        >
          🧠 Show visual view
        </button>
      </div>
    );
  }

  const shellClass =
    variant === "primary" || expanded
      ? "flex h-full min-h-0 min-w-0 flex-1 flex-col border-t border-[#e7dfd4] bg-gradient-to-b from-[#faf7f2] to-[#f5efe6] lg:border-t-0 lg:border-l"
      : "flex h-full min-h-0 min-w-0 flex-col border-t border-[#e7dfd4] bg-gradient-to-b from-[#faf7f2] to-[#f5efe6] lg:w-[min(44%,480px)] lg:shrink-0 lg:border-t-0 lg:border-l";

  return (
    <div className={shellClass} data-testid="brain-dump-visual-panel">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e7dfd4]/80 bg-white/70 px-3 py-2">
        <p className="text-sm font-bold uppercase tracking-wide text-[#1e4f4f]">
          {viewMode === "mindmap"
            ? "Related Thoughts"
            : viewMode === "infographic"
              ? "Summary"
              : "Thought Clusters"}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ["cluster", "Clusters"],
              ["mindmap", "Related"],
              ["infographic", "Summary"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchView(mode)}
              className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold ${
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
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5 disabled:opacity-40"
          >
            PNG
          </button>
          <button
            type="button"
            disabled={!graph.hasContent}
            onClick={() => exportBrainDumpVisualPdf(graph)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5 disabled:opacity-40"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => printBrainDumpVisual(infographicRef.current)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
          >
            Print
          </button>
          <button
            type="button"
            onClick={toggleVisible}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#6b635a] hover:bg-black/5"
          >
            Hide
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {viewMode === "cluster" ? (
          <BrainDumpClusterView
            entries={entries}
            hideCenterHub={hideClusterCenter}
          />
        ) : viewMode === "mindmap" ? (
          <BrainDumpMindMapView entries={entries} />
        ) : (
          <BrainDumpInfographic entries={entries} exportRef={infographicRef} />
        )}
      </div>
    </div>
  );
}
