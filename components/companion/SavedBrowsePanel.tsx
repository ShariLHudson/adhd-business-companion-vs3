"use client";

import { useMemo, useState } from "react";
import type { AppSection } from "@/lib/companionUi";
import { listPinnedVisualFocusMaps } from "@/lib/visualFocus/store";
import { buildSavedBrowseIndex, searchSavedBrowse } from "@/lib/savedBrowseIndex";
import { buildVisualThinkingByCategory } from "@/lib/myWorkHub";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { EcosystemCollapsibleSection } from "@/components/companion/EcosystemCollapsibleSection";
import { getProjects, getSnippets, getTemplates } from "@/lib/companionStore";
import { getSavedWork } from "@/lib/savedWorkStore";
import { buildMyWorkHub } from "@/lib/myWorkHub";
import { listSavedVisualFocusMaps } from "@/lib/visualFocus/store";

type SavedCategoryId =
  | "projects"
  | "visual-thinking"
  | "strategies"
  | "templates"
  | "snippets"
  | "documents"
  | "decision-compass"
  | "sops";

const SAVED_CATEGORIES: {
  id: SavedCategoryId;
  label: string;
  objectId: string;
}[] = [
  { id: "visual-thinking", label: "Visual Thinking", objectId: "visual-thinking" },
  { id: "projects", label: "Projects", objectId: "projects" },
  { id: "strategies", label: "Strategies", objectId: "strategies" },
  { id: "templates", label: "Templates", objectId: "templates" },
  { id: "documents", label: "Documents", objectId: "templates" },
  { id: "decision-compass", label: "Decision Compass", objectId: "decision-compass" },
  { id: "snippets", label: "Snippets", objectId: "toolbelt-snippets" },
  { id: "sops", label: "SOPs", objectId: "content-types" },
];

export function SavedBrowsePanel({
  onBack,
  onOpenSection,
  onOpenVisualFocusMap,
}: {
  onBack: () => void;
  onOpenSection: (section: AppSection) => void;
  onOpenVisualFocusMap?: (mapId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<SavedCategoryId>>(
    new Set(),
  );

  const pinned = useMemo(() => listPinnedVisualFocusMaps(), []);
  const searchResults = useMemo(
    () => (query.trim() ? searchSavedBrowse(query) : []),
    [query],
  );

  const counts = useMemo(() => {
    const hub = buildMyWorkHub();
    const savedMaps = listSavedVisualFocusMaps();
    return {
      projects: getProjects().filter((p) => p.status !== "completed").length,
      visualThinking: savedMaps.length,
      strategies: hub.strategies.length,
      templates: getTemplates().filter((t) => t.status !== "archived").length,
      snippets: getSnippets().length,
      documents: getSavedWork().filter(
        (w) =>
          w.status !== "archived" &&
          !w.artifactType.toLowerCase().includes("sop"),
      ).length,
      sops: getSavedWork().filter(
        (w) =>
          w.status !== "archived" &&
          w.artifactType.toLowerCase().includes("sop"),
      ).length,
      decisionCompass: 0,
      favorites: pinned.length,
      total: buildSavedBrowseIndex().length,
    };
  }, [pinned.length]);

  const visualCategories = useMemo(() => buildVisualThinkingByCategory(), []);

  function toggleCategory(id: SavedCategoryId) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCategory(id: SavedCategoryId) {
    switch (id) {
      case "projects":
        onOpenSection("projects");
        break;
      case "visual-thinking":
        break;
      case "strategies":
        onOpenSection("playbook");
        break;
      case "templates":
        onOpenSection("templates-library");
        break;
      case "snippets":
        onOpenSection("snippets");
        break;
      case "documents":
      case "sops":
        onOpenSection("saved-work");
        break;
      case "decision-compass":
        onOpenSection("decision-compass");
        break;
    }
  }

  return (
    <div data-testid="saved-browse-panel">
      <GrowthPanelBackButton onBack={onBack} label="Other" />
      <h2 className="mt-4 text-2xl font-bold text-stone-900">Saved</h2>
      <p className="mt-1 text-sm text-stone-600">
        Find something from the past — simple browsing, not a file manager.
      </p>

      <div className="mt-4">
        <label htmlFor="saved-search" className="sr-only">
          Search saved work
        </label>
        <input
          id="saved-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search Saved Work"
          className="w-full rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          data-testid="saved-search"
        />
      </div>

      {query.trim() ? (
        <ul className="mt-4 space-y-2">
          {searchResults.length === 0 ? (
            <li className="text-sm text-stone-600">No matches.</li>
          ) : (
            searchResults.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (hit.id.startsWith("visual-focus:")) {
                      onOpenVisualFocusMap?.(hit.id.replace(/^visual-focus:/, ""));
                    } else if (hit.id.startsWith("project:")) {
                      onOpenSection("projects");
                    } else if (hit.id.startsWith("saved-work:")) {
                      onOpenSection("saved-work");
                    } else {
                      openCategory(
                        hit.category === "SOPs"
                          ? "sops"
                          : hit.category === "Templates"
                            ? "templates"
                            : hit.category === "Snippets"
                              ? "snippets"
                              : hit.category === "Strategies"
                                ? "strategies"
                                : "documents",
                      );
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-left hover:bg-stone-50"
                >
                  <span>
                    <span className="block font-semibold text-stone-900">
                      {hit.title}
                    </span>
                    <span className="text-xs text-stone-500">{hit.category}</span>
                  </span>
                  <span className="text-xs font-semibold text-teal-800">Open →</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : (
        <>
          {pinned.length > 0 ? (
            <section className="mt-5" data-testid="saved-favorites">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                ⭐ Favorites
              </p>
              <ul className="mt-2 space-y-2">
                {pinned.map((map) => (
                  <li key={map.id}>
                    <button
                      type="button"
                      onClick={() => onOpenVisualFocusMap?.(map.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-left hover:bg-amber-50"
                    >
                      <span>
                        <span className="block font-semibold text-stone-900">
                          {map.title}
                        </span>
                        <span className="text-xs text-stone-500">
                          Visual Thinking · Pinned
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-teal-800">
                        Open →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {SAVED_CATEGORIES.map((cat) => {
              const count =
                cat.id === "visual-thinking"
                  ? counts.visualThinking
                  : cat.id === "projects"
                    ? counts.projects
                    : cat.id === "strategies"
                      ? counts.strategies
                      : cat.id === "templates"
                        ? counts.templates
                        : cat.id === "snippets"
                          ? counts.snippets
                          : cat.id === "sops"
                            ? counts.sops
                            : cat.id === "decision-compass"
                              ? counts.decisionCompass
                              : counts.documents;

              return (
                <EcosystemCollapsibleSection
                  key={cat.id}
                  title={cat.label}
                  objectId={cat.objectId}
                  description={`Saved ${cat.label.toLowerCase()}.`}
                  open={openCategories.has(cat.id)}
                  onToggle={() => toggleCategory(cat.id)}
                  count={count}
                  testId={`saved-category-${cat.id}`}
                >
                  {cat.id === "visual-thinking" ? (
                    visualCategories.length === 0 ? (
                      <p className="text-sm text-stone-600">
                        Nothing saved here yet. Use Save on a map when insights are
                        worth keeping.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {visualCategories.map((group) => (
                          <div key={group.label}>
                            <p className="text-xs font-bold uppercase text-stone-500">
                              {group.label}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {group.items.map((item) => (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenVisualFocusMap?.(
                                        item.openTarget.kind === "visual-focus"
                                          ? item.openTarget.mapId
                                          : item.id.replace(/^visual-focus:/, ""),
                                      )
                                    }
                                    className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm hover:bg-stone-50"
                                  >
                                    <span className="font-medium text-stone-900">
                                      {item.title}
                                    </span>
                                    <span className="text-xs text-teal-800">Open</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => openCategory(cat.id)}
                      className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                      Open {cat.label} →
                    </button>
                  )}
                </EcosystemCollapsibleSection>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
