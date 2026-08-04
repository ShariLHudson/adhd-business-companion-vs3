/**
 * P0.41 — Saved Items move destinations (avoid junk-drawer stagnation).
 */

import { createPortfolioEntry } from "./portfolioStore";
import { createSnippet, getSnippets } from "./companionStore";
import { deleteSavedWork, getSavedWork, type SavedWorkItem } from "./savedWorkStore";

export type SavedItemMoveDestination =
  | "project"
  | "strategy"
  | "template"
  | "snippet"
  | "portfolio"
  | "goal"
  | "delete";

export const SAVED_ITEM_MOVE_OPTIONS: {
  id: SavedItemMoveDestination;
  label: string;
}[] = [
  { id: "project", label: "Project" },
  { id: "strategy", label: "Strategy" },
  { id: "template", label: "Template" },
  { id: "snippet", label: "Snippet" },
  { id: "portfolio", label: "Portfolio" },
  { id: "goal", label: "Goal" },
  { id: "delete", label: "Delete" },
];

export type SavedItemMoveResult =
  | { ok: true; message: string; openSection?: string }
  | { ok: false; message: string };

export function executeSavedItemMove(
  itemId: string,
  destination: SavedItemMoveDestination,
): SavedItemMoveResult {
  const item = getSavedWork().find((w) => w.id === itemId);
  if (!item) {
    return { ok: false, message: "Saved item not found." };
  }

  switch (destination) {
    case "delete":
      deleteSavedWork(item.id);
      return { ok: true, message: "Deleted." };
    case "snippet": {
      const body = item.body?.trim() || item.title.trim() || "Snippet";
      createSnippet({
        content: body,
        tags: item.tags ?? [],
      });
      deleteSavedWork(item.id);
      return { ok: true, message: "Moved to Snippets.", openSection: "snippets" };
    }
    case "portfolio": {
      createPortfolioEntry({
        title: item.title.trim() || "Saved work",
        assetType: "Other",
        description: item.body?.trim() ?? "",
        link: "",
        completedAt: new Date().toISOString().slice(0, 10),
        attachments: [],
      });
      deleteSavedWork(item.id);
      return { ok: true, message: "Moved to Portfolio™.", openSection: "portfolio" };
    }
    case "goal": {
      sessionStorage.setItem(
        "companion-goal-progress-prefill-v1",
        JSON.stringify({ note: item.body ?? item.title, goalId: undefined }),
      );
      deleteSavedWork(item.id);
      return { ok: true, message: "Open Outcome Goals to link progress.", openSection: "outcome-goals" };
    }
    case "project":
      return {
        ok: true,
        message: "Open Projects to attach this content to active work.",
        openSection: "projects",
      };
    case "strategy":
      return {
        ok: true,
        message: "Open Strategies to save as a reusable solution.",
        openSection: "playbook",
      };
    case "template":
      return {
        ok: true,
        message: "Open Templates to save as a starting point.",
        openSection: "templates-library",
      };
    default:
      return { ok: false, message: "Unknown destination." };
  }
}

export function savedItemMoveLabel(id: SavedItemMoveDestination): string {
  return SAVED_ITEM_MOVE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/** Snippet count helper for tests */
export function snippetCount(): number {
  return getSnippets().length;
}

export type { SavedWorkItem };
