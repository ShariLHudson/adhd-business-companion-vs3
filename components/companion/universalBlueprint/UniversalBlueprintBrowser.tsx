"use client";

import { useMemo, useState } from "react";
import {
  browseCompatibleBlueprintsAutoBroaden,
  defaultRecommendedBlueprintIds,
  type BlueprintBrowserItem,
  type BlueprintBrowserSourceFilter,
  type BlueprintBrowserView,
} from "@/lib/universalBlueprintInterface";
import type { BlueprintComplexity, BlueprintDepthMode } from "@/lib/universalWorkEngine";

type Props = {
  workTypeId: string;
  recentBlueprintIds?: readonly string[];
  onSelect: (item: BlueprintBrowserItem) => void;
  onBack?: () => void;
};

const SOURCES: { id: BlueprintBrowserSourceFilter; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "spark", label: "Spark" },
  { id: "personal", label: "Personal" },
  { id: "company", label: "Company" },
  { id: "recent", label: "Recent" },
  { id: "all", label: "All" },
];

/**
 * Guided structure browser — registry-backed, auto-broadens empty filters (127).
 */
export function UniversalBlueprintBrowser({
  workTypeId,
  recentBlueprintIds = [],
  onSelect,
  onBack,
}: Props) {
  const [search, setSearch] = useState("");
  const [source, setSource] =
    useState<BlueprintBrowserSourceFilter>("recommended");
  const [complexity, setComplexity] = useState<BlueprintComplexity | "all">(
    "all",
  );
  const [depthMode, setDepthMode] = useState<BlueprintDepthMode | "all">("all");
  const [view, setView] = useState<BlueprintBrowserView>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const recommendedBlueprintIds = useMemo(
    () => defaultRecommendedBlueprintIds(workTypeId),
    [workTypeId],
  );

  const browseResult = useMemo(
    () =>
      browseCompatibleBlueprintsAutoBroaden({
        workTypeId,
        search,
        source,
        complexity,
        depthMode,
        recentBlueprintIds,
        recommendedBlueprintIds,
      }),
    [
      workTypeId,
      search,
      source,
      complexity,
      depthMode,
      recentBlueprintIds,
      recommendedBlueprintIds,
    ],
  );
  const items = browseResult.items;

  return (
    <section
      className="ubi-root"
      data-testid="universal-blueprint-browser"
      aria-labelledby="ubi-browser-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ubi-browser-heading" className="text-xl">
            Choose a recommended structure
          </h2>
          <p className="ubi-muted mt-1">
            Only structures that fit this kind of work are shown.
          </p>
        </div>
        {onBack ? (
          <button
            type="button"
            className="ubi-secondary"
            onClick={onBack}
            data-testid="ubi-browser-back"
          >
            Back
          </button>
        ) : null}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Search structures</span>
        <input
          className="ubi-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or purpose"
          data-testid="ubi-browser-search"
        />
      </label>

      <div className="ubi-chip-row mt-3" role="toolbar" aria-label="Structure source">
        {SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="ubi-chip"
            aria-pressed={source === s.id}
            data-testid={`ubi-source-${s.id}`}
            onClick={() => setSource(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="ubi-secondary text-sm"
          data-testid="ubi-browser-more-filters"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? "Fewer filters" : "More filters"}
        </button>
        <button
          type="button"
          className="ubi-secondary text-sm"
          data-testid="ubi-browser-view-toggle"
          onClick={() => setView((v) => (v === "list" ? "cards" : "list"))}
        >
          {view === "list" ? "Card view" : "List view"}
        </button>
      </div>

      {filtersOpen ? (
        <div
          className="ubi-panel mt-3 flex flex-wrap gap-3"
          data-testid="ubi-browser-filters"
        >
          <label className="text-sm">
            Detail
            <select
              className="ubi-field mt-1"
              value={complexity}
              onChange={(e) =>
                setComplexity(e.target.value as BlueprintComplexity | "all")
              }
              data-testid="ubi-filter-complexity"
            >
              <option value="all">Any</option>
              <option value="simple">Lighter</option>
              <option value="moderate">Balanced</option>
              <option value="complex">Thorough</option>
            </select>
          </label>
          <label className="text-sm">
            Depth
            <select
              className="ubi-field mt-1"
              value={depthMode}
              onChange={(e) =>
                setDepthMode(e.target.value as BlueprintDepthMode | "all")
              }
              data-testid="ubi-filter-depth"
            >
              <option value="all">Any</option>
              <option value="quick_start">Quick Start</option>
              <option value="guided_build">Guided Build</option>
              <option value="complete_planning">Complete Planning</option>
            </select>
          </label>
        </div>
      ) : null}

      {browseResult.broadenNote ? (
        <p
          className="ubi-muted mt-3 text-sm"
          data-testid="ubi-browser-broadened"
          role="status"
        >
          {browseResult.broadenNote}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="ubi-muted mt-4" data-testid="ubi-browser-empty">
          Nothing fits yet — describe what you want to create above, and Shari
          will choose a structure with you.
        </p>
      ) : (
        <ul
          className={
            view === "cards"
              ? "mt-4 grid gap-3 sm:grid-cols-2"
              : "ubi-list mt-4"
          }
          data-testid="ubi-browser-results"
          data-view={view}
          data-broadened={browseResult.broadened ? "true" : "false"}
          data-effective-source={browseResult.effectiveSource}
        >
          {items.map((item) => (
            <li key={item.blueprintId}>
              <button
                type="button"
                className="ubi-list-item"
                data-testid={`ubi-blueprint-${item.blueprintId}`}
                onClick={() => onSelect(item)}
              >
                <span className="block font-semibold">{item.title}</span>
                <span className="ubi-muted mt-1 block">{item.description}</span>
                <span className="ubi-muted mt-2 block text-xs uppercase tracking-wide">
                  {item.category}
                  {item.recommended ? " · recommended" : ""}
                  {item.recentlyUsed ? " · recent" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
