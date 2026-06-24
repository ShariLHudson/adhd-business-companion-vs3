/**
 * Cross-category search index for Other™ → Saved™.
 */

import { getProjects, getSnippets, getTemplates } from "./companionStore";
import { getSavedWork } from "./savedWorkStore";
import { listSavedVisualFocusMaps } from "./visualFocus/store";
import { myWorkCategoryLabelForMode } from "./visualFocus/myWorkIntegration";
import { buildMyWorkHub } from "./myWorkHub";

export type SavedBrowseHit = {
  id: string;
  title: string;
  category: string;
  subtitle?: string;
};

export function buildSavedBrowseIndex(): SavedBrowseHit[] {
  const hits: SavedBrowseHit[] = [];

  for (const map of listSavedVisualFocusMaps()) {
    hits.push({
      id: `visual-focus:${map.id}`,
      title: map.title,
      category: "Visual Thinking",
      subtitle:
        map.lifecycleStatus === "archived"
          ? `${myWorkCategoryLabelForMode(map.mode)} · Archived`
          : myWorkCategoryLabelForMode(map.mode),
    });
  }

  for (const project of getProjects().filter((p) => p.status !== "completed")) {
    hits.push({
      id: `project:${project.id}`,
      title: project.name,
      category: "Projects",
    });
  }

  for (const template of getTemplates().filter((t) => t.status !== "archived")) {
    hits.push({
      id: `template:${template.id}`,
      title: template.title,
      category: "Templates",
    });
  }

  for (const snippet of getSnippets()) {
    hits.push({
      id: `snippet:${snippet.id}`,
      title: snippet.content.slice(0, 80) || "Snippet",
      category: "Snippets",
    });
  }

  for (const doc of getSavedWork().filter((w) => w.status !== "archived")) {
    const category = doc.artifactType.toLowerCase().includes("sop")
      ? "SOPs"
      : "Documents";
    hits.push({
      id: `saved-work:${doc.id}`,
      title: doc.title,
      category,
      subtitle: doc.artifactType,
    });
  }

  for (const strategy of buildMyWorkHub().strategies) {
    hits.push({
      id: strategy.id,
      title: strategy.title,
      category: "Strategies",
    });
  }

  return hits;
}

export function searchSavedBrowse(query: string): SavedBrowseHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildSavedBrowseIndex().filter((hit) => {
    const haystack = [hit.title, hit.category, hit.subtitle ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
