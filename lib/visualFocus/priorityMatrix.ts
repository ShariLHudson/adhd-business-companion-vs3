/**
 * P0.51 — Priority Matrix™ guided scoring (impact × effort).
 */

import type { VisualKanbanCard, VisualKanbanColumn } from "./types";

export type PriorityMatrixQuadrantId =
  | "quick-wins"
  | "major-projects"
  | "fill-in-tasks"
  | "avoid";

export type PriorityMatrixFocusLock = "quick-wins" | "major-projects" | null;

export const PRIORITY_MATRIX_QUADRANTS: {
  id: PriorityMatrixQuadrantId;
  label: string;
}[] = [
  { id: "quick-wins", label: "Quick Wins" },
  { id: "major-projects", label: "Major Projects" },
  { id: "fill-in-tasks", label: "Fill-In Tasks" },
  { id: "avoid", label: "Avoid" },
];

const QUADRANT_LABELS = Object.fromEntries(
  PRIORITY_MATRIX_QUADRANTS.map((q) => [q.id, q.label]),
) as Record<PriorityMatrixQuadrantId, string>;

export function quadrantForScores(
  impact: number,
  effort: number,
): PriorityMatrixQuadrantId {
  const highImpact = impact >= 3;
  const highEffort = effort >= 3;
  if (highImpact && !highEffort) return "quick-wins";
  if (highImpact && highEffort) return "major-projects";
  if (!highImpact && !highEffort) return "fill-in-tasks";
  return "avoid";
}

export function priorityMatrixColumnId(
  mapId: string,
  quadrant: PriorityMatrixQuadrantId,
): string {
  return `col-${mapId}-${quadrant}`;
}

export function createPriorityMatrixKanban(mapId: string): {
  columns: VisualKanbanColumn[];
  cards: Record<string, VisualKanbanCard>;
} {
  const columns = PRIORITY_MATRIX_QUADRANTS.map((q) => ({
    id: priorityMatrixColumnId(mapId, q.id),
    label: q.label,
    cardIds: [] as string[],
  }));
  return { columns, cards: {} };
}

export function parsePriorityCardMeta(label: string): {
  name: string;
  impact: number;
  effort: number;
} | null {
  const match = label.match(/^(.+?) · Impact (\d) · Effort (\d)$/);
  if (!match) return null;
  return {
    name: match[1]!,
    impact: Number(match[2]),
    effort: Number(match[3]),
  };
}

export function formatPriorityCardLabel(
  name: string,
  impact: number,
  effort: number,
): string {
  return `${name.trim()} · Impact ${impact} · Effort ${effort}`;
}

export function quadrantLabelForCard(label: string): string | null {
  const meta = parsePriorityCardMeta(label);
  if (!meta) return null;
  const q = quadrantForScores(meta.impact, meta.effort);
  return QUADRANT_LABELS[q];
}
