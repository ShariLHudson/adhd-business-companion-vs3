/**
 * Prompt 143 — Strategy intelligence soft awareness of Estate surfaces.
 * Strategies understand related places; they do not force navigation.
 */

export type StrategyEstateSurfaceId =
  | "project"
  | "work"
  | "cartography"
  | "chamber"
  | "board"
  | "evidence"
  | "wins"
  | "business-pulse";

export type StrategyEstateSurface = {
  id: StrategyEstateSurfaceId;
  label: string;
  /** How this strategy quietly relates — not a menu item */
  relation: string;
};

/** Surfaces a strategy may quietly inform or draw from. */
export const STRATEGY_ESTATE_SURFACES: readonly StrategyEstateSurface[] = [
  {
    id: "project",
    label: "Projects",
    relation: "Connects the first step to Current Focus when you choose.",
  },
  {
    id: "work",
    label: "Work to Create",
    relation: "May become a document, offer, or deliverable when you’re ready.",
  },
  {
    id: "cartography",
    label: "Visual Thinking Studio",
    relation: "Larger patterns and relationships may clarify why this fits.",
  },
  {
    id: "chamber",
    label: "Chamber",
    relation: "Specialist perspectives already shape the strategy detail.",
  },
  {
    id: "board",
    label: "Board",
    relation: "Optional stress-test for high-stakes decisions — never forced.",
  },
  {
    id: "evidence",
    label: "Evidence",
    relation: "What worked before can strengthen confidence in this move.",
  },
  {
    id: "wins",
    label: "Wins",
    relation: "Progress from applying a strategy can become a quiet win.",
  },
  {
    id: "business-pulse",
    label: "Business Pulse",
    relation: "Business health may hint which strategies matter most now.",
  },
] as const;

export function strategyEstateIntelligenceSummary(): string {
  return STRATEGY_ESTATE_SURFACES.map((s) => s.label).join(" · ");
}
