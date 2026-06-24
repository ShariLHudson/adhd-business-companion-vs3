"use client";

import { useState } from "react";
import type { BusinessCanvasData, BusinessCanvasSectionId } from "@/lib/visualFocus/businessCanvas/types";
import { guidanceForSection } from "@/lib/visualFocus/businessCanvas/guidance";
import { companionSuggestionsForSection } from "@/lib/visualFocus/businessCanvas/suggestions";
import { BUSINESS_CANVAS_GLOBAL_GUIDES } from "@/lib/visualFocus/businessCanvas/canvasGuide";
import {
  BUSINESS_CANVAS_GRID_CELLS,
  BUSINESS_CANVAS_GRID_TEMPLATE,
  themeForSection,
} from "@/lib/visualFocus/businessCanvas/sectionTheme";
import {
  IMPACT_STATE_RING,
} from "@/lib/visualFocus/businessCanvas/impactModel/impactEstimate";
import type {
  CanvasImpactStateMap,
  CanvasImpactVisualState,
} from "@/lib/visualFocus/businessCanvas/impactModel/types";
import {
  BUSINESS_CANVAS_INTRO_HEADLINE,
  BUSINESS_CANVAS_INTRO_SUPPORT,
} from "@/lib/visualFocus/businessCanvas/copy";

function GlobalGuide() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-white p-3"
      data-testid="business-canvas-global-guide"
    >
      <p className="text-sm font-semibold text-[#1f1c19]">{BUSINESS_CANVAS_INTRO_HEADLINE}</p>
      <p className="mt-1 text-xs text-[#6b635a]">{BUSINESS_CANVAS_INTRO_SUPPORT}</p>
      <div className="mt-3 space-y-1">
        {BUSINESS_CANVAS_GLOBAL_GUIDES.map((guide) => {
          const open = openId === guide.id;
          return (
            <div key={guide.id} className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : guide.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-[#1e4f4f]"
                aria-expanded={open}
              >
                <span>
                  {open ? "▼" : "▸"} {guide.title}
                </span>
              </button>
              {open ? (
                <ul className="space-y-1 border-t border-[#e7dfd4] px-3 py-2 text-xs leading-relaxed text-[#6b635a]">
                  {guide.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionMeaningHelp({ sectionId }: { sectionId: BusinessCanvasSectionId }) {
  const [open, setOpen] = useState(false);
  const guidance = guidanceForSection(sectionId);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={open}
      >
        What does this mean? {open ? "▾" : "▸"}
      </button>
      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-[#e7dfd4] bg-white p-3 text-xs text-[#2f261f]">
          <p>{guidance.explanation}</p>
          <p>
            <span className="font-semibold">Why it matters:</span> {guidance.whyItMatters}
          </p>
          <div>
            <p className="font-semibold">Examples:</p>
            <ul className="mt-1 list-inside list-disc text-[#6b635a]">
              {guidance.examples.slice(0, 4).map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">What happens if this changes?</p>
            <ul className="mt-1 list-inside list-disc text-[#6b635a]">
              {guidance.changeRipples.slice(0, 3).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CollapsibleSuggestions({
  sectionId,
  onPick,
}: {
  sectionId: BusinessCanvasSectionId;
  onPick: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const suggestions = companionSuggestionsForSection(sectionId).slice(0, 3);
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-semibold text-[#1e4f4f] hover:underline"
        aria-expanded={open}
      >
        Suggestions ({suggestions.length}) {open ? "▾" : "▸"}
      </button>
      {open ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[#1e4f4f] ring-1 ring-[#e7dfd4] hover:bg-[#1e4f4f]/5"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BoxEditor({
  sectionId,
  items,
  onChange,
  onClose,
}: {
  sectionId: BusinessCanvasSectionId;
  items: string[];
  onChange: (items: string[]) => void;
  onClose: () => void;
}) {
  const guidance = guidanceForSection(sectionId);
  const theme = themeForSection(sectionId);
  const rows = items.length > 0 ? items : [""];

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addSuggestion(label: string) {
    if (items.some((i) => i.trim() === label.trim())) return;
    onChange([...items.filter((i) => i.trim()), label]);
  }

  return (
    <div
      className="mt-2 space-y-2 border-t pt-2"
      style={{ borderColor: theme.ring }}
      data-testid={`business-canvas-box-editor-${sectionId}`}
    >
      <p className="text-sm font-medium text-[#1f1c19]">{guidance.prompt}</p>
      <SectionMeaningHelp sectionId={sectionId} />
      <ul className="space-y-2">
        {rows.map((item, i) => (
          <li key={`${sectionId}-row-${i}`} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Add entry…`}
              className="min-w-0 flex-1 rounded-lg border border-[#e7dfd4] bg-white px-2 py-1.5 text-sm focus:border-[#1e4f4f] focus:outline-none"
            />
            {rows.length > 1 || item.trim() ? (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="shrink-0 text-xs text-[#9a8f82] hover:text-red-700"
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addItem}
        className="text-xs font-semibold text-[#1e4f4f]"
      >
        + Add entry
      </button>
      <CollapsibleSuggestions sectionId={sectionId} onPick={addSuggestion} />
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163b3b]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function CanvasBox({
  sectionId,
  items,
  expanded,
  highlighted,
  impactState,
  onOpen,
  onClose,
  onChange,
}: {
  sectionId: BusinessCanvasSectionId;
  items: string[];
  expanded: boolean;
  highlighted?: boolean;
  impactState?: CanvasImpactVisualState;
  onOpen: () => void;
  onClose: () => void;
  onChange: (items: string[]) => void;
}) {
  const theme = themeForSection(sectionId);
  const guidance = guidanceForSection(sectionId);
  const filled = items.filter((i) => i.trim());
  const preview = filled.slice(0, 2).join(" · ");
  const impactRing =
    impactState && impactState !== "none"
      ? IMPACT_STATE_RING[impactState]
      : null;

  return (
    <div
      className={`flex min-h-[88px] flex-col rounded-xl border-2 p-2 shadow-sm transition-shadow sm:min-h-[100px] ${
        expanded ? "z-10 row-span-2 shadow-md" : ""
      } ${highlighted || impactRing ? "ring-2 ring-offset-1" : ""}`}
      style={{
        gridArea: theme.gridArea,
        borderColor: theme.color,
        backgroundColor: theme.bg,
        ...(highlighted ? { boxShadow: `0 0 0 2px ${theme.ring}` } : {}),
        ...(impactRing && !highlighted
          ? { boxShadow: `0 0 0 2px ${impactRing.ring}` }
          : {}),
      }}
      data-testid={`business-canvas-box-${sectionId}`}
      data-expanded={expanded ? "true" : "false"}
      data-impact-state={impactState ?? "none"}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold leading-tight text-[#1f1c19] sm:text-xs">
            <span aria-hidden="true">{theme.emoji} </span>
            {guidance.title}
          </p>
          <p className="mt-0.5 text-[10px] text-[#6b635a] sm:text-xs">
            {filled.length > 0
              ? `${filled.length} ${filled.length === 1 ? "entry" : "entries"}`
              : "No entries yet"}
          </p>
          {impactRing?.label ? (
            <p className="mt-0.5 text-[10px] font-semibold text-[#6b635a]">
              {impactRing.label}
            </p>
          ) : null}
        </div>
        {expanded ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-[#e7dfd4] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6b635a] hover:bg-[#faf7f2] sm:text-xs"
            data-testid={`business-canvas-close-${sectionId}`}
          >
            Close
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white sm:text-xs"
            style={{ backgroundColor: theme.color }}
            data-testid={`business-canvas-open-${sectionId}`}
          >
            Open
          </button>
        )}
      </div>

      {!expanded ? (
        <p className="mt-1 line-clamp-2 flex-1 text-[10px] leading-snug text-[#2f261f] sm:text-xs">
          {preview || guidance.prompt}
        </p>
      ) : (
        <BoxEditor
          sectionId={sectionId}
          items={items}
          onChange={onChange}
          onClose={onClose}
        />
      )}
    </div>
  );
}

export function BusinessCanvasInteractiveCanvas({
  data,
  onChange,
  centerTitle,
  highlightedSections,
  impactStates,
}: {
  data: BusinessCanvasData;
  onChange: (data: BusinessCanvasData) => void;
  centerTitle?: string;
  /** Future Living Canvas™ — ripple highlight on related boxes. */
  highlightedSections?: BusinessCanvasSectionId[];
  /** Future impact / what-if visual states per section. */
  impactStates?: CanvasImpactStateMap;
}) {
  const [expandedSection, setExpandedSection] =
    useState<BusinessCanvasSectionId | null>(null);

  function updateSection(sectionId: BusinessCanvasSectionId, items: string[]) {
    onChange({
      ...data,
      sections: {
        ...data.sections,
        [sectionId]: { items },
      },
    });
  }

  function openSection(id: BusinessCanvasSectionId) {
    setExpandedSection(id);
  }

  function closeSection() {
    setExpandedSection(null);
  }

  const highlightSet = new Set(highlightedSections ?? []);

  return (
    <div className="space-y-4" data-testid="business-canvas-interactive-canvas">
      <GlobalGuide />

      {centerTitle ? (
        <p className="text-center text-sm font-semibold text-[#1e4f4f]">{centerTitle}</p>
      ) : null}

      <div
        className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] p-2 sm:p-3"
        data-testid="business-canvas-grid"
      >
        {/* Desktop / tablet — classic BMC grid */}
        <div
          className="hidden min-h-[380px] gap-2 sm:grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 0.85fr",
            gridTemplateAreas: BUSINESS_CANVAS_GRID_TEMPLATE,
          }}
        >
          {BUSINESS_CANVAS_GRID_CELLS.map((cell) => (
            <CanvasBox
              key={cell.id}
              sectionId={cell.id}
              items={data.sections[cell.id].items}
              expanded={expandedSection === cell.id}
              highlighted={highlightSet.has(cell.id)}
              impactState={impactStates?.[cell.id]}
              onOpen={() => openSection(cell.id)}
              onClose={closeSection}
              onChange={(items) => updateSection(cell.id, items)}
            />
          ))}
        </div>

        {/* Mobile — stacked cards preserving section order, still visual cards not a form */}
        <div className="grid grid-cols-1 gap-2 sm:hidden">
          {BUSINESS_CANVAS_GRID_CELLS.map((cell) => (
            <div key={cell.id} style={{ gridArea: "auto" }}>
              <CanvasBox
                sectionId={cell.id}
                items={data.sections[cell.id].items}
                expanded={expandedSection === cell.id}
                highlighted={highlightSet.has(cell.id)}
                impactState={impactStates?.[cell.id]}
                onOpen={() => openSection(cell.id)}
                onClose={closeSection}
                onChange={(items) => updateSection(cell.id, items)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
