/**
 * Save destination choices — user picks where work lands under Other > Saved.
 */

import type { VisualFocusMode } from "./visualFocus/types";
import { studioCardTitleForMode } from "./visualFocus/studioCards";

export type SaveDestinationId =
  | "visual-thinking"
  | "projects"
  | "strategies"
  | "templates"
  | "documents"
  | "decision-compass"
  | "sops"
  | "snippets";

/** Save To options — Visual Thinking first per product spec. */
export const SAVE_DESTINATION_OPTIONS: {
  id: SaveDestinationId;
  label: string;
}[] = [
  { id: "visual-thinking", label: "Visual Thinking" },
  { id: "projects", label: "Projects" },
  { id: "strategies", label: "Strategies" },
  { id: "templates", label: "Templates" },
  { id: "documents", label: "Documents" },
  { id: "decision-compass", label: "Decision Compass" },
  { id: "sops", label: "SOPs" },
  { id: "snippets", label: "Snippets" },
];

export function suggestSaveDestinationForVisualMap(
  mode: VisualFocusMode,
): { destination: SaveDestinationId; reason: string } {
  const label = studioCardTitleForMode(mode);
  return {
    destination: "visual-thinking",
    reason: `This appears to be a ${label}.`,
  };
}

export function suggestSaveDestination(hints: {
  artifactType?: string | null;
  sourceWorkspace?: string | null;
}): SaveDestinationId {
  const type = (hints.artifactType ?? "").toLowerCase();
  const source = (hints.sourceWorkspace ?? "").toLowerCase();
  if (type.includes("sop") || source.includes("sop")) return "sops";
  if (source.includes("visual") || type.includes("map") || type.includes("canvas")) {
    return "visual-thinking";
  }
  if (type.includes("strateg") || source.includes("playbook")) return "strategies";
  if (type.includes("template")) return "templates";
  if (type.includes("snippet")) return "snippets";
  if (type.includes("project")) return "projects";
  if (type.includes("decision") || source.includes("compass")) return "decision-compass";
  return "documents";
}

export function saveDestinationLabel(id: SaveDestinationId): string {
  return SAVE_DESTINATION_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
